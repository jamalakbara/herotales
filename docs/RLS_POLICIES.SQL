-- Additional RLS Policies for INSERT, UPDATE, DELETE operations

-- Children table policies
CREATE POLICY "Parents can insert their own children" 
  ON children FOR INSERT 
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own children" 
  ON children FOR UPDATE 
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their own children" 
  ON children FOR DELETE 
  USING (auth.uid() = parent_id);

-- Stories table policies
CREATE POLICY "Parents can insert stories for their children" 
  ON stories FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM children WHERE children.id = stories.child_id AND children.parent_id = auth.uid())
  );

CREATE POLICY "Parents can update stories for their children" 
  ON stories FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM children WHERE children.id = stories.child_id AND children.parent_id = auth.uid())
  );

CREATE POLICY "Parents can delete stories for their children" 
  ON stories FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM children WHERE children.id = stories.child_id AND children.parent_id = auth.uid())
  );

-- Story images table policies
CREATE POLICY "Parents can view images for their children's stories" 
  ON story_images FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      JOIN children ON children.id = stories.child_id 
      WHERE stories.id = story_images.story_id 
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert images for their children's stories" 
  ON story_images FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories 
      JOIN children ON children.id = stories.child_id 
      WHERE stories.id = story_images.story_id 
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update images for their children's stories" 
  ON story_images FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      JOIN children ON children.id = stories.child_id 
      WHERE stories.id = story_images.story_id 
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete images for their children's stories" 
  ON story_images FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      JOIN children ON children.id = stories.child_id 
      WHERE stories.id = story_images.story_id 
      AND children.parent_id = auth.uid()
    )
  );
