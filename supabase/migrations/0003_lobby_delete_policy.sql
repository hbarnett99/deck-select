CREATE POLICY "admin can delete own lobby"
  ON lobbies FOR DELETE
  USING (auth.uid() = admin_id);
