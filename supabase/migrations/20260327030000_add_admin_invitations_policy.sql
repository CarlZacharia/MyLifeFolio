-- Allow admin users to read all invitations from the admin dashboard
DROP POLICY IF EXISTS "Admins can read all invitations" ON invitations;
CREATE POLICY "Admins can read all invitations"
  ON invitations
  FOR SELECT
  USING (
    used_by = auth.uid()
    OR lower(auth.jwt() ->> 'email') IN ('czacharia@zacbrownlaw.com', 'support@seniorcares.com')
  );
