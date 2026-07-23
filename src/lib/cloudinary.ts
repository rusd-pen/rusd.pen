export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  original_filename: string;
}

export async function uploadFileToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'usvnnqap';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'pdf_upload';

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary Cloud Name atau Upload Preset belum dikonfigurasi.');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            resolve(data.secure_url);
          } else {
            reject(new Error('URL file tidak ditemukan dalam respon Cloudinary.'));
          }
        } catch {
          reject(new Error('Gagal mengurai respon dari Cloudinary.'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error?.message || `Gagal mengunggah ke Cloudinary (Status ${xhr.status})`));
        } catch {
          reject(new Error(`Gagal mengunggah ke Cloudinary (Status ${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Gagal terhubung ke server Cloudinary. Periksa koneksi internet Anda.'));
    };

    xhr.send(formData);
  });
}