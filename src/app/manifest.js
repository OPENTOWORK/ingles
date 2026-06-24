import {
  DRALO_APP_ICON_SRC,
  DRALO_BRAND_NAME,
  DRALO_BRAND_SHORT_NAME,
  DRALO_MANIFEST_ICONS,
  DRALO_THEME_COLOR,
} from '@/config/brandAssets';
import { SEO_PAGE_META } from '@/lib/siteSeo';

export default function manifest() {
  return {
    name: DRALO_BRAND_NAME,
    short_name: DRALO_BRAND_SHORT_NAME,
    description: SEO_PAGE_META.home.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: DRALO_THEME_COLOR,
    icons: [
      ...DRALO_MANIFEST_ICONS,
      {
        src: DRALO_APP_ICON_SRC,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
