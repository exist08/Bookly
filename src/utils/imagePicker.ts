import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';
import { toast } from 'sonner-native';

export type PickSource = 'camera' | 'library';

/**
 * Picks an image and returns a local file uri. The picker resizes on device
 * (covers ~1200px on the long edge, avatars 600px) before anything is uploaded.
 */
export async function pickImage(source: PickSource, kind: 'cover' | 'avatar'): Promise<string | null> {
  const max = kind === 'cover' ? 1200 : 600;
  const options = {
    mediaType: 'photo' as const,
    quality: 0.8 as const,
    maxWidth: max,
    maxHeight: max,
    selectionLimit: 1,
  };
  let res: ImagePickerResponse;
  try {
    res = source === 'camera' ? await launchCamera({ ...options, saveToPhotos: false }) : await launchImageLibrary(options);
  } catch {
    toast.error('Couldn’t open the picker');
    return null;
  }
  if (res.didCancel) {
    return null;
  }
  if (res.errorCode) {
    toast.error(res.errorCode === 'camera_unavailable' ? 'No camera available on this device' : 'Couldn’t get that photo');
    return null;
  }
  return res.assets?.[0]?.uri ?? null;
}
