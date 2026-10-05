import * as migration_20260901_170000_variants_origin_collections from './20260901_170000_variants_origin_collections';
import * as migration_20260901_180000_categories_absorb_collections from './20260901_180000_categories_absorb_collections';
import * as migration_20260901_190000_regions_collection from './20260901_190000_regions_collection';
import * as migration_20260901_200000_import_provenance from './20260901_200000_import_provenance';
import * as migration_20260902_120000_team_collection from './20260902_120000_team_collection';
import * as migration_20260902_130000_brand_marks from './20260902_130000_brand_marks';
import * as migration_20260906_190000_drop_media_og_size from './20260906_190000_drop_media_og_size';
import * as migration_20260906_210000_site_settings_notifications from './20260906_210000_site_settings_notifications';
import * as migration_20260906_213000_order_fulfilment from './20260906_213000_order_fulfilment';
import * as migration_20260906_223000_fulfilment_role from './20260906_223000_fulfilment_role';
import * as migration_20260906_230000_partner_portal from './20260906_230000_partner_portal';
import * as migration_20261004_134814_banner_product from './20261004_134814_banner_product';
import * as migration_20261005_024217_algeria_region from './20261005_024217_algeria_region';
import * as migration_20261005_024300_algeria_region_row from './20261005_024300_algeria_region_row';

export const migrations = [
  {
    up: migration_20260901_170000_variants_origin_collections.up,
    down: migration_20260901_170000_variants_origin_collections.down,
    name: '20260901_170000_variants_origin_collections',
  },
  {
    up: migration_20260901_180000_categories_absorb_collections.up,
    down: migration_20260901_180000_categories_absorb_collections.down,
    name: '20260901_180000_categories_absorb_collections',
  },
  {
    up: migration_20260901_190000_regions_collection.up,
    down: migration_20260901_190000_regions_collection.down,
    name: '20260901_190000_regions_collection',
  },
  {
    up: migration_20260901_200000_import_provenance.up,
    down: migration_20260901_200000_import_provenance.down,
    name: '20260901_200000_import_provenance',
  },
  {
    up: migration_20260902_120000_team_collection.up,
    down: migration_20260902_120000_team_collection.down,
    name: '20260902_120000_team_collection',
  },
  {
    up: migration_20260902_130000_brand_marks.up,
    down: migration_20260902_130000_brand_marks.down,
    name: '20260902_130000_brand_marks',
  },
  {
    up: migration_20260906_190000_drop_media_og_size.up,
    down: migration_20260906_190000_drop_media_og_size.down,
    name: '20260906_190000_drop_media_og_size',
  },
  {
    up: migration_20260906_210000_site_settings_notifications.up,
    down: migration_20260906_210000_site_settings_notifications.down,
    name: '20260906_210000_site_settings_notifications',
  },
  {
    up: migration_20260906_213000_order_fulfilment.up,
    down: migration_20260906_213000_order_fulfilment.down,
    name: '20260906_213000_order_fulfilment',
  },
  {
    up: migration_20260906_223000_fulfilment_role.up,
    down: migration_20260906_223000_fulfilment_role.down,
    name: '20260906_223000_fulfilment_role',
  },
  {
    up: migration_20260906_230000_partner_portal.up,
    down: migration_20260906_230000_partner_portal.down,
    name: '20260906_230000_partner_portal',
  },
  {
    up: migration_20261004_134814_banner_product.up,
    down: migration_20261004_134814_banner_product.down,
    name: '20261004_134814_banner_product',
  },
  {
    up: migration_20261005_024217_algeria_region.up,
    down: migration_20261005_024217_algeria_region.down,
    name: '20261005_024217_algeria_region'
  },
  {
    up: migration_20261005_024300_algeria_region_row.up,
    down: migration_20261005_024300_algeria_region_row.down,
    name: '20261005_024300_algeria_region_row',
  },
];
