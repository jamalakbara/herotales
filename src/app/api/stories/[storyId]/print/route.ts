import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { StoryContent } from "@/types/database";
import { jsPDF } from "jspdf";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await params;
    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get story with child data
    const { data: story, error } = await supabase
      .from("stories")
      .select(`
        *,
        child:children(nickname),
        images:story_images(chapter_index, image_url)
      `)
      .eq("id", storyId)
      .single();

    if (error || !story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const storyContent = story.full_story_json as StoryContent;
    const childName = story.child?.nickname || "Hero";

    console.log("Story images:", story.images);
    console.log("Number of images:", story.images?.length || 0);

    // Generate PDF
    const pdfData = await generateStoryPdf(storyContent, childName, story.images || []);

    return new Response(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${storyContent.title.replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

interface StoryImage {
  chapter_index: number;
  image_url: string;
}

async function generateStoryPdf(
  content: StoryContent,
  childName: string,
  images: StoryImage[]
): Promise<ArrayBuffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Cover page
  doc.setFillColor(255, 242, 215); // Cream background
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(106, 137, 204); // Periwinkle
  const titleLines = doc.splitTextToSize(content.title, contentWidth);
  doc.text(titleLines, pageWidth / 2, 80, { align: "center" });

  doc.setFontSize(18);
  doc.setTextColor(161, 190, 149); // Sage
  doc.text(`Starring: ${childName} ⭐`, pageWidth / 2, 100 + (titleLines.length * 10), { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(`A story about ${content.theme}`, pageWidth / 2, 120 + (titleLines.length * 10), { align: "center" });

  doc.setFontSize(10);
  doc.text("Created with HeroTales AI", pageWidth / 2, pageHeight - 30, { align: "center" });

  // Chapters
  const imageMap = new Map(images.map(img => [img.chapter_index, img.image_url]));

  for (const chapter of content.chapters) {
    doc.addPage();

    // Chapter background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    let yPosition = margin;

    // Add chapter image if available
    const imageUrl = imageMap.get(chapter.chapterNumber);
    console.log(`Chapter ${chapter.chapterNumber}: Looking for image at index ${chapter.chapterNumber}`);
    console.log(`Found image URL:`, imageUrl);

    if (imageUrl) {
      try {
        console.log(`Fetching image from:`, imageUrl);
        // Fetch and embed image
        const imageResponse = await fetch(imageUrl);
        console.log(`Image response status:`, imageResponse.status);

        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        const imageBlob = await imageResponse.blob();
        console.log(`Image blob size:`, imageBlob.size);
        const imageBase64 = await blobToBase64(imageBlob);

        const imgWidth = contentWidth;
        const imgHeight = 80; // Fixed height for consistency

        doc.addImage(imageBase64, "JPEG", margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
        console.log(`Successfully added image for chapter ${chapter.chapterNumber}`);
      } catch (error) {
        console.error(`Failed to load image for chapter ${chapter.chapterNumber}:`, error);
        // Continue without image
      }
    } else {
      console.log(`No image URL found for chapter ${chapter.chapterNumber}`);
    }

    // Chapter number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(106, 137, 204);
    doc.text(`Chapter ${chapter.chapterNumber}`, margin, yPosition);
    yPosition += 8;

    // Chapter title
    doc.setFontSize(20);
    doc.setTextColor(51, 51, 51);
    const chapterTitleLines = doc.splitTextToSize(chapter.title, contentWidth);
    doc.text(chapterTitleLines, margin, yPosition);
    yPosition += (chapterTitleLines.length * 8) + 10;

    // Chapter content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);

    const contentLines = doc.splitTextToSize(chapter.content, contentWidth);
    const lineHeight = 6;

    for (const line of contentLines) {
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage();
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    }
  }

  // Moral page
  doc.addPage();
  doc.setFillColor(255, 242, 215);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Add decorative border
  doc.setDrawColor(161, 190, 149);
  doc.setLineWidth(0.5);
  doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (margin * 2) + 10);

  const moralYStart = pageHeight / 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(161, 190, 149);
  doc.text("The Lesson", pageWidth / 2, moralYStart, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(14);
  doc.setTextColor(51, 51, 51);
  const moralLines = doc.splitTextToSize(`"${content.moral}"`, contentWidth - 40);
  doc.text(moralLines, pageWidth / 2, moralYStart + 15, { align: "center" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("~ The End ~", pageWidth / 2, pageHeight - 30, { align: "center" });
  doc.setFontSize(8);
  doc.text("Created with love by HeroTales AI", pageWidth / 2, pageHeight - 20, { align: "center" });

  // Return as ArrayBuffer
  return doc.output("arraybuffer");
}

// Helper function to convert blob to base64 (Node.js compatible)
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${blob.type};base64,${buffer.toString('base64')}`;
}
