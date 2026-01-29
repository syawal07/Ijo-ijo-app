export const getDriveImage = (url: string | undefined | null): string => {
  if (!url) return '';

  // 1. Cek apakah ini link Google Drive
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    
    // 2. Regex Kuat untuk ambil ID File (di antara /d/ dan /view atau /)
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const id = idMatch ? idMatch[1] : null;

    if (id) {
      // 3. PAKE LINK "THUMBNAIL" (Paling Ampuh & Stabil)
      // sz=w1000 artinya minta gambar ukuran lebar 1000px (HD)
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
  }

  // Kalau bukan link drive, kembalikan aslinya
  return url;
};