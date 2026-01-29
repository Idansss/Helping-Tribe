-- Create storage buckets for file uploads

-- Certificates bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Final exams bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('final-exams', 'final-exams', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for certificates (public read)
CREATE POLICY "Certificates are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

CREATE POLICY "Users can upload certificates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for final exams (private, user-specific)
CREATE POLICY "Users can view own final exam submissions"
ON storage.objects FOR SELECT
USING (bucket_id = 'final-exams' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own final exam submissions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'final-exams' AND auth.uid()::text = (storage.foldername(name))[1]);
