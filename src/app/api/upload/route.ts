import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type based on folder
    const allowedTypes: Record<string, string[]> = {
      resumes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      profile_photos: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      company_logos: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml'],
    };

    const folderTypes = allowedTypes[folder] || allowedTypes.profile_photos;
    if (!folderTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${folderTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result: any = await uploadToCloudinary(buffer, folder);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
