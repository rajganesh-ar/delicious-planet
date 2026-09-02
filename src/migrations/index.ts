import * as migration_20260901_170000 from './20260901_170000_variants_origin_collections'
import * as migration_20260901_180000 from './20260901_180000_categories_absorb_collections'
import * as migration_20260901_190000 from './20260901_190000_regions_collection'
import * as migration_20260901_200000 from './20260901_200000_import_provenance'
import * as migration_20260902_120000 from './20260902_120000_team_collection'
import * as migration_20260902_130000 from './20260902_130000_brand_marks'

export const migrations = [
  {
    up: migration_20260901_170000.up,
    down: migration_20260901_170000.down,
    name: '20260901_170000_variants_origin_collections',
  },
  {
    up: migration_20260901_180000.up,
    down: migration_20260901_180000.down,
    name: '20260901_180000_categories_absorb_collections',
  },
  {
    up: migration_20260901_190000.up,
    down: migration_20260901_190000.down,
    name: '20260901_190000_regions_collection',
  },
  {
    up: migration_20260901_200000.up,
    down: migration_20260901_200000.down,
    name: '20260901_200000_import_provenance',
  },
  {
    up: migration_20260902_120000.up,
    down: migration_20260902_120000.down,
    name: '20260902_120000_team_collection',
  },
  {
    up: migration_20260902_130000.up,
    down: migration_20260902_130000.down,
    name: '20260902_130000_brand_marks',
  },
]
