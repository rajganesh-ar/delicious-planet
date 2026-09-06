import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The partner portal: vendor applications, chef profiles and recipes.
 *
 * Three new collections behind /portal. A supplier fills in a long
 * questionnaire, a chef registers an account, and a chef writes recipes whose
 * ingredients are catalogue products with a quantity and a unit — which is why
 * `recipes_ingredients.product_id` is a foreign key to `products` and there is
 * no free-text ingredient column anywhere below. The database is the last
 * place that rule is enforced, after the picker and the collection config, and
 * the only one that cannot be talked round.
 *
 * Two roles are added to `users_roles` as well. Neither opens the admin panel:
 * `chef` unlocks the recipe portal, `vendor` is there for an applicant account
 * once one exists. Purely additive — no existing row changes, and neither role
 * is granted to anybody.
 *
 * The DDL here was taken from `payload migrate:create` and reduced to the
 * delta. That command emits a from-scratch baseline on this database (see the
 * note beside `push` in payload.config.ts — there was no snapshot for it to
 * diff against), so what follows is the new-object half of that output, with
 * the `ALTER TYPE` for the roles enum written by hand because the generated
 * version recreates the type instead of extending it.
 *
 * The snapshot that run produced is kept beside this file as
 * 20260906_230000_partner_portal.json. It is the missing piece the config note
 * describes: with it in place, the next `migrate:create` has something to diff
 * against and should emit a real delta rather than another baseline. Check
 * what it generates before trusting it — this is the first migration on this
 * database with a snapshot behind it.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- ── Roles ──────────────────────────────────────────────────────────
    -- ADD VALUE inside a transaction needs Postgres 12+; this database is
    -- 18.6, and neither value is read back in this transaction, which is the
    -- remaining restriction.
    ALTER TYPE "public"."enum_users_roles" ADD VALUE IF NOT EXISTS 'chef';
    ALTER TYPE "public"."enum_users_roles" ADD VALUE IF NOT EXISTS 'vendor';

    -- ── Enums ──────────────────────────────────────────────────────────
    CREATE TYPE "public"."enum_vendor_applications_temperature_regimes" AS ENUM('ambient', 'chilled', 'frozen', 'controlled_atmosphere');
    CREATE TYPE "public"."enum_vendor_applications_certifications" AS ENUM('haccp', 'iso_22000', 'iso_9001', 'brcgs', 'ifs', 'fssc_22000', 'globalgap', 'halal', 'kosher', 'organic', 'fairtrade', 'rainforest_alliance', 'msc_asc', 'non_gmo', 'sedex', 'other');
    CREATE TYPE "public"."enum_vendor_applications_incoterms" AS ENUM('exw', 'fca', 'fob', 'cfr', 'cif', 'cpt', 'cip', 'dap', 'ddp');
    CREATE TYPE "public"."enum_vendor_applications_currencies" AS ENUM('AED', 'USD', 'EUR', 'GBP', 'INR');
    CREATE TYPE "public"."enum_vendor_applications_payment_terms" AS ENUM('advance', 'letter_of_credit', 'dp', 'net_30', 'net_60', 'net_90', 'negotiable');
    CREATE TYPE "public"."enum_vendor_applications_business_type" AS ENUM('producer', 'cooperative', 'marine', 'processor', 'brand_owner', 'exporter', 'distributor', 'logistics');
    CREATE TYPE "public"."enum_vendor_applications_employee_band" AS ENUM('1_10', '11_50', '51_200', '201_1000', 'over_1000');
    CREATE TYPE "public"."enum_vendor_applications_annual_turnover" AS ENUM('under_250k', '250k_1m', '1m_5m', '5m_20m', 'over_20m', 'undisclosed');
    CREATE TYPE "public"."enum_vendor_applications_preferred_contact" AS ENUM('email', 'phone', 'whatsapp');
    CREATE TYPE "public"."enum_vendor_applications_country" AS ENUM('DZ', 'AR', 'AU', 'AT', 'BH', 'BD', 'BE', 'BO', 'BR', 'KH', 'CA', 'CL', 'CN', 'CO', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DO', 'EC', 'EG', 'SV', 'ET', 'FI', 'FR', 'DE', 'GH', 'GR', 'GT', 'HN', 'HU', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'JP', 'JO', 'KE', 'KW', 'LB', 'LY', 'MG', 'MY', 'MX', 'MA', 'NP', 'NL', 'NZ', 'NI', 'NG', 'NO', 'OM', 'PK', 'PS', 'PA', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RW', 'SA', 'SN', 'RS', 'SG', 'SK', 'SI', 'ZA', 'KR', 'ES', 'LK', 'SE', 'CH', 'SY', 'TW', 'TZ', 'TH', 'TN', 'TR', 'UG', 'AE', 'GB', 'US', 'UY', 'VE', 'VN', 'YE');
    CREATE TYPE "public"."enum_vendor_applications_lead_time" AS ENUM('under_2w', '2_4w', '4_8w', 'over_8w');
    CREATE TYPE "public"."enum_vendor_applications_traceability" AS ENUM('batch', 'farm', 'chain_of_custody', 'none');
    CREATE TYPE "public"."enum_vendor_applications_how_heard" AS ENUM('trade_show', 'referral', 'search', 'social', 'outreach', 'other');
    CREATE TYPE "public"."enum_vendor_applications_status" AS ENUM('new', 'in_review', 'verification', 'approved', 'on_hold', 'rejected');
    CREATE TYPE "public"."enum_vendor_applications_tier" AS ENUM('developmental', 'approved', 'strategic');
    CREATE TYPE "public"."enum_chef_profiles_cuisines" AS ENUM('italian', 'french', 'spanish', 'mediterranean', 'middle_eastern', 'levantine', 'north_african', 'indian', 'japanese', 'chinese', 'thai', 'korean', 'latin_american', 'nordic', 'modern_european', 'pastry', 'plant_based');
    CREATE TYPE "public"."enum_chef_profiles_chef_role" AS ENUM('executive_chef', 'head_chef', 'sous_chef', 'pastry_chef', 'chef_de_partie', 'private_chef', 'consultant', 'instructor', 'developer', 'home_cook');
    CREATE TYPE "public"."enum_chef_profiles_kitchen_type" AS ENUM('fine_dining', 'casual', 'hotel', 'bakery', 'cafe', 'catering', 'cloud_kitchen', 'school', 'private', 'independent');
    CREATE TYPE "public"."enum_chef_profiles_experience" AS ENUM('under_2', '2_5', '5_10', '10_20', 'over_20');
    CREATE TYPE "public"."enum_chef_profiles_country" AS ENUM('DZ', 'AR', 'AU', 'AT', 'BH', 'BD', 'BE', 'BO', 'BR', 'KH', 'CA', 'CL', 'CN', 'CO', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DO', 'EC', 'EG', 'SV', 'ET', 'FI', 'FR', 'DE', 'GH', 'GR', 'GT', 'HN', 'HU', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'JP', 'JO', 'KE', 'KW', 'LB', 'LY', 'MG', 'MY', 'MX', 'MA', 'NP', 'NL', 'NZ', 'NI', 'NG', 'NO', 'OM', 'PK', 'PS', 'PA', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RW', 'SA', 'SN', 'RS', 'SG', 'SK', 'SI', 'ZA', 'KR', 'ES', 'LK', 'SE', 'CH', 'SY', 'TW', 'TZ', 'TH', 'TN', 'TR', 'UG', 'AE', 'GB', 'US', 'UY', 'VE', 'VN', 'YE');
    CREATE TYPE "public"."enum_chef_profiles_status" AS ENUM('pending', 'verified', 'on_hold', 'declined');
    CREATE TYPE "public"."enum_recipes_ingredients_unit" AS ENUM('g', 'kg', 'mg', 'oz', 'lb', 'ml', 'cl', 'l', 'tsp', 'tbsp', 'cup', 'fl-oz', 'piece', 'clove', 'slice', 'sheet', 'sprig', 'leaf', 'bunch', 'handful', 'pinch', 'dash', 'drop', 'can', 'jar', 'packet', 'to-taste');
    CREATE TYPE "public"."enum_recipes_course" AS ENUM('starter', 'soup', 'salad', 'main', 'side', 'pasta_rice', 'bakery', 'dessert', 'sauce', 'breakfast', 'drink');
    CREATE TYPE "public"."enum_recipes_cuisine" AS ENUM('italian', 'french', 'spanish', 'mediterranean', 'middle_eastern', 'levantine', 'north_african', 'indian', 'japanese', 'chinese', 'thai', 'korean', 'latin_american', 'nordic', 'modern_european', 'pastry', 'plant_based');
    CREATE TYPE "public"."enum_recipes_difficulty" AS ENUM('easy', 'intermediate', 'advanced');
    CREATE TYPE "public"."enum_recipes_status" AS ENUM('draft', 'submitted', 'published', 'changes_requested', 'archived');

    -- ── Vendor applications ────────────────────────────────────────────
    CREATE TABLE "vendor_applications" (
      "id" serial PRIMARY KEY NOT NULL,
      "company_name" varchar NOT NULL,
      "trading_name" varchar,
      "business_type" "enum_vendor_applications_business_type" NOT NULL,
      "website" varchar,
      "year_established" numeric,
      "registration_number" varchar,
      "tax_id" varchar,
      "employee_band" "enum_vendor_applications_employee_band",
      "annual_turnover" "enum_vendor_applications_annual_turnover",
      "company_profile" varchar NOT NULL,
      "contact_name" varchar NOT NULL,
      "contact_role" varchar,
      "email" varchar NOT NULL,
      "phone" varchar NOT NULL,
      "whatsapp" varchar,
      "preferred_contact" "enum_vendor_applications_preferred_contact" DEFAULT 'email',
      "country" "enum_vendor_applications_country" NOT NULL,
      "address_line1" varchar,
      "address_line2" varchar,
      "address_city" varchar,
      "address_state" varchar,
      "address_postal_code" varchar,
      "production_sites" varchar,
      "product_summary" varchar NOT NULL,
      "brands_owned" varchar,
      "monthly_capacity" varchar,
      "minimum_order" varchar,
      "lead_time" "enum_vendor_applications_lead_time",
      "shelf_life_months" numeric,
      "packaging_formats" varchar,
      "seasonality" varchar,
      "private_label_capable" boolean DEFAULT false,
      "samples_available" boolean DEFAULT false,
      "traceability" "enum_vendor_applications_traceability" NOT NULL,
      "recall_procedure" boolean DEFAULT false,
      "last_audit_body" varchar,
      "last_audit_date" timestamp(3) with time zone,
      "food_safety_notes" varchar,
      "ethics_no_forced_or_child_labour" boolean DEFAULT false,
      "ethics_safe_working_conditions" boolean DEFAULT false,
      "ethics_labour_law_compliance" boolean DEFAULT false,
      "ethics_notes" varchar,
      "insurance_product_liability" boolean DEFAULT false,
      "insurance_insurer" varchar,
      "insurance_cover_amount" varchar,
      "sustainability" varchar,
      "exports_today" boolean DEFAULT false,
      "export_markets" varchar,
      "gcc_experience" boolean DEFAULT false,
      "uae_registered" boolean DEFAULT false,
      "ports_of_loading" varchar,
      "cold_chain_capable" boolean DEFAULT false,
      "logistics_notes" varchar,
      "price_list_id" integer,
      "catalogue_id" integer,
      "open_to_exclusivity" boolean DEFAULT false,
      "marketing_support" varchar,
      "how_heard" "enum_vendor_applications_how_heard",
      "additional_notes" varchar,
      "signatory_name" varchar NOT NULL,
      "signatory_role" varchar NOT NULL,
      "declaration_accepted" boolean DEFAULT false,
      "consent_contact" boolean DEFAULT false,
      "reference" varchar,
      "submitted_at" timestamp(3) with time zone,
      "status" "enum_vendor_applications_status" DEFAULT 'new' NOT NULL,
      "tier" "enum_vendor_applications_tier",
      "reviewer_id" integer,
      "linked_supplier_id" integer,
      "internal_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "vendor_applications_temperature_regimes" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_vendor_applications_temperature_regimes",
      "id" serial PRIMARY KEY NOT NULL
    );

    CREATE TABLE "vendor_applications_certifications" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_vendor_applications_certifications",
      "id" serial PRIMARY KEY NOT NULL
    );

    CREATE TABLE "vendor_applications_certification_docs" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "issuing_body" varchar,
      "reference" varchar,
      "expires_at" timestamp(3) with time zone,
      "file_id" integer
    );

    CREATE TABLE "vendor_applications_incoterms" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_vendor_applications_incoterms",
      "id" serial PRIMARY KEY NOT NULL
    );

    CREATE TABLE "vendor_applications_currencies" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_vendor_applications_currencies",
      "id" serial PRIMARY KEY NOT NULL
    );

    CREATE TABLE "vendor_applications_payment_terms" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_vendor_applications_payment_terms",
      "id" serial PRIMARY KEY NOT NULL
    );

    CREATE TABLE "vendor_applications_references" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "company" varchar NOT NULL,
      "contact_name" varchar,
      "email" varchar,
      "phone" varchar,
      "relationship" varchar
    );

    CREATE TABLE "vendor_applications_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "categories_id" integer
    );

    -- ── Chef profiles ──────────────────────────────────────────────────
    CREATE TABLE "chef_profiles" (
      "id" serial PRIMARY KEY NOT NULL,
      "account_id" integer NOT NULL,
      "display_name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "email" varchar NOT NULL,
      "phone" varchar,
      "portrait_id" integer,
      "chef_role" "enum_chef_profiles_chef_role" NOT NULL,
      "establishment" varchar,
      "kitchen_type" "enum_chef_profiles_kitchen_type",
      "experience" "enum_chef_profiles_experience" NOT NULL,
      "specialities" varchar,
      "bio" varchar NOT NULL,
      "city" varchar,
      "country" "enum_chef_profiles_country" NOT NULL,
      "links_website" varchar,
      "links_instagram" varchar,
      "links_youtube" varchar,
      "links_linkedin" varchar,
      "awards" varchar,
      "motivation" varchar,
      "consent_publish" boolean DEFAULT false,
      "consent_terms" boolean DEFAULT false,
      "status" "enum_chef_profiles_status" DEFAULT 'pending' NOT NULL,
      "featured" boolean DEFAULT false,
      "internal_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "chef_profiles_cuisines" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_chef_profiles_cuisines",
      "id" serial PRIMARY KEY NOT NULL
    );

    CREATE TABLE "chef_profiles_qualifications" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "institution" varchar,
      "year" numeric
    );

    CREATE TABLE "chef_profiles_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "products_id" integer
    );

    -- ── Recipes ────────────────────────────────────────────────────────
    CREATE TABLE "recipes" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "summary" varchar NOT NULL,
      "hero_image_id" integer,
      "course" "enum_recipes_course" NOT NULL,
      "cuisine" "enum_recipes_cuisine",
      "difficulty" "enum_recipes_difficulty" DEFAULT 'intermediate',
      "servings" numeric DEFAULT 4 NOT NULL,
      "prep_minutes" numeric,
      "cook_minutes" numeric,
      "total_minutes" numeric,
      "chef_tips" varchar,
      "pairing" varchar,
      "allergens" varchar,
      "author_id" integer NOT NULL,
      "chef_id" integer,
      "chef_name" varchar,
      "chef_title" varchar,
      "status" "enum_recipes_status" DEFAULT 'draft' NOT NULL,
      "review_feedback" varchar,
      "internal_notes" varchar,
      "featured" boolean DEFAULT false,
      "submitted_at" timestamp(3) with time zone,
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "recipes_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer NOT NULL
    );

    -- The ingredient line. product_id is a foreign key and there is no text
    -- column beside it, which is what makes "our products only" a property of
    -- the schema rather than a convention.
    CREATE TABLE "recipes_ingredients" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "product_id" integer NOT NULL,
      "variant_sku" varchar,
      "quantity" numeric,
      "unit" "enum_recipes_ingredients_unit" DEFAULT 'g' NOT NULL,
      "preparation" varchar,
      "section" varchar,
      "optional" boolean DEFAULT false
    );

    CREATE TABLE "recipes_method" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "instruction" varchar NOT NULL,
      "image_id" integer,
      "timer_minutes" numeric
    );

    -- ── Foreign keys ───────────────────────────────────────────────────
    ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_price_list_id_media_id_fk" FOREIGN KEY ("price_list_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_catalogue_id_media_id_fk" FOREIGN KEY ("catalogue_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_linked_supplier_id_suppliers_id_fk" FOREIGN KEY ("linked_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "vendor_applications_temperature_regimes" ADD CONSTRAINT "vendor_applications_temperature_regimes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "vendor_applications_certifications" ADD CONSTRAINT "vendor_applications_certifications_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "vendor_applications_certification_docs" ADD CONSTRAINT "vendor_applications_certification_docs_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "vendor_applications_certification_docs" ADD CONSTRAINT "vendor_applications_certification_docs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "vendor_applications_incoterms" ADD CONSTRAINT "vendor_applications_incoterms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "vendor_applications_currencies" ADD CONSTRAINT "vendor_applications_currencies_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "vendor_applications_payment_terms" ADD CONSTRAINT "vendor_applications_payment_terms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "vendor_applications_references" ADD CONSTRAINT "vendor_applications_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "vendor_applications_rels" ADD CONSTRAINT "vendor_applications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "vendor_applications_rels" ADD CONSTRAINT "vendor_applications_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "chef_profiles" ADD CONSTRAINT "chef_profiles_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "chef_profiles" ADD CONSTRAINT "chef_profiles_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "chef_profiles_cuisines" ADD CONSTRAINT "chef_profiles_cuisines_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chef_profiles"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "chef_profiles_qualifications" ADD CONSTRAINT "chef_profiles_qualifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chef_profiles"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "chef_profiles_rels" ADD CONSTRAINT "chef_profiles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chef_profiles"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "chef_profiles_rels" ADD CONSTRAINT "chef_profiles_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "recipes" ADD CONSTRAINT "recipes_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "recipes" ADD CONSTRAINT "recipes_chef_id_chef_profiles_id_fk" FOREIGN KEY ("chef_id") REFERENCES "public"."chef_profiles"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "recipes_gallery" ADD CONSTRAINT "recipes_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "recipes_gallery" ADD CONSTRAINT "recipes_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "recipes_ingredients" ADD CONSTRAINT "recipes_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "recipes_method" ADD CONSTRAINT "recipes_method_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "recipes_method" ADD CONSTRAINT "recipes_method_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;

    -- ── Indexes ────────────────────────────────────────────────────────
    CREATE INDEX "vendor_applications_company_name_idx" ON "vendor_applications" USING btree ("company_name");
    CREATE INDEX "vendor_applications_business_type_idx" ON "vendor_applications" USING btree ("business_type");
    CREATE INDEX "vendor_applications_email_idx" ON "vendor_applications" USING btree ("email");
    CREATE INDEX "vendor_applications_country_idx" ON "vendor_applications" USING btree ("country");
    CREATE INDEX "vendor_applications_price_list_idx" ON "vendor_applications" USING btree ("price_list_id");
    CREATE INDEX "vendor_applications_catalogue_idx" ON "vendor_applications" USING btree ("catalogue_id");
    CREATE UNIQUE INDEX "vendor_applications_reference_idx" ON "vendor_applications" USING btree ("reference");
    CREATE INDEX "vendor_applications_status_idx" ON "vendor_applications" USING btree ("status");
    CREATE INDEX "vendor_applications_reviewer_idx" ON "vendor_applications" USING btree ("reviewer_id");
    CREATE INDEX "vendor_applications_linked_supplier_idx" ON "vendor_applications" USING btree ("linked_supplier_id");
    CREATE INDEX "vendor_applications_updated_at_idx" ON "vendor_applications" USING btree ("updated_at");
    CREATE INDEX "vendor_applications_created_at_idx" ON "vendor_applications" USING btree ("created_at");
    CREATE INDEX "vendor_applications_temperature_regimes_order_idx" ON "vendor_applications_temperature_regimes" USING btree ("order");
    CREATE INDEX "vendor_applications_temperature_regimes_parent_idx" ON "vendor_applications_temperature_regimes" USING btree ("parent_id");
    CREATE INDEX "vendor_applications_certifications_order_idx" ON "vendor_applications_certifications" USING btree ("order");
    CREATE INDEX "vendor_applications_certifications_parent_idx" ON "vendor_applications_certifications" USING btree ("parent_id");
    CREATE INDEX "vendor_applications_certification_docs_order_idx" ON "vendor_applications_certification_docs" USING btree ("_order");
    CREATE INDEX "vendor_applications_certification_docs_parent_id_idx" ON "vendor_applications_certification_docs" USING btree ("_parent_id");
    CREATE INDEX "vendor_applications_certification_docs_file_idx" ON "vendor_applications_certification_docs" USING btree ("file_id");
    CREATE INDEX "vendor_applications_incoterms_order_idx" ON "vendor_applications_incoterms" USING btree ("order");
    CREATE INDEX "vendor_applications_incoterms_parent_idx" ON "vendor_applications_incoterms" USING btree ("parent_id");
    CREATE INDEX "vendor_applications_currencies_order_idx" ON "vendor_applications_currencies" USING btree ("order");
    CREATE INDEX "vendor_applications_currencies_parent_idx" ON "vendor_applications_currencies" USING btree ("parent_id");
    CREATE INDEX "vendor_applications_payment_terms_order_idx" ON "vendor_applications_payment_terms" USING btree ("order");
    CREATE INDEX "vendor_applications_payment_terms_parent_idx" ON "vendor_applications_payment_terms" USING btree ("parent_id");
    CREATE INDEX "vendor_applications_references_order_idx" ON "vendor_applications_references" USING btree ("_order");
    CREATE INDEX "vendor_applications_references_parent_id_idx" ON "vendor_applications_references" USING btree ("_parent_id");
    CREATE INDEX "vendor_applications_rels_order_idx" ON "vendor_applications_rels" USING btree ("order");
    CREATE INDEX "vendor_applications_rels_parent_idx" ON "vendor_applications_rels" USING btree ("parent_id");
    CREATE INDEX "vendor_applications_rels_path_idx" ON "vendor_applications_rels" USING btree ("path");
    CREATE INDEX "vendor_applications_rels_categories_id_idx" ON "vendor_applications_rels" USING btree ("categories_id");

    CREATE UNIQUE INDEX "chef_profiles_account_idx" ON "chef_profiles" USING btree ("account_id");
    CREATE INDEX "chef_profiles_display_name_idx" ON "chef_profiles" USING btree ("display_name");
    CREATE UNIQUE INDEX "chef_profiles_slug_idx" ON "chef_profiles" USING btree ("slug");
    CREATE INDEX "chef_profiles_email_idx" ON "chef_profiles" USING btree ("email");
    CREATE INDEX "chef_profiles_portrait_idx" ON "chef_profiles" USING btree ("portrait_id");
    CREATE INDEX "chef_profiles_country_idx" ON "chef_profiles" USING btree ("country");
    CREATE INDEX "chef_profiles_status_idx" ON "chef_profiles" USING btree ("status");
    CREATE INDEX "chef_profiles_updated_at_idx" ON "chef_profiles" USING btree ("updated_at");
    CREATE INDEX "chef_profiles_created_at_idx" ON "chef_profiles" USING btree ("created_at");
    CREATE INDEX "chef_profiles_cuisines_order_idx" ON "chef_profiles_cuisines" USING btree ("order");
    CREATE INDEX "chef_profiles_cuisines_parent_idx" ON "chef_profiles_cuisines" USING btree ("parent_id");
    CREATE INDEX "chef_profiles_qualifications_order_idx" ON "chef_profiles_qualifications" USING btree ("_order");
    CREATE INDEX "chef_profiles_qualifications_parent_id_idx" ON "chef_profiles_qualifications" USING btree ("_parent_id");
    CREATE INDEX "chef_profiles_rels_order_idx" ON "chef_profiles_rels" USING btree ("order");
    CREATE INDEX "chef_profiles_rels_parent_idx" ON "chef_profiles_rels" USING btree ("parent_id");
    CREATE INDEX "chef_profiles_rels_path_idx" ON "chef_profiles_rels" USING btree ("path");
    CREATE INDEX "chef_profiles_rels_products_id_idx" ON "chef_profiles_rels" USING btree ("products_id");

    CREATE INDEX "recipes_title_idx" ON "recipes" USING btree ("title");
    CREATE UNIQUE INDEX "recipes_slug_idx" ON "recipes" USING btree ("slug");
    CREATE INDEX "recipes_hero_image_idx" ON "recipes" USING btree ("hero_image_id");
    CREATE INDEX "recipes_course_idx" ON "recipes" USING btree ("course");
    CREATE INDEX "recipes_cuisine_idx" ON "recipes" USING btree ("cuisine");
    CREATE INDEX "recipes_total_minutes_idx" ON "recipes" USING btree ("total_minutes");
    CREATE INDEX "recipes_author_idx" ON "recipes" USING btree ("author_id");
    CREATE INDEX "recipes_chef_idx" ON "recipes" USING btree ("chef_id");
    CREATE INDEX "recipes_status_idx" ON "recipes" USING btree ("status");
    CREATE INDEX "recipes_featured_idx" ON "recipes" USING btree ("featured");
    CREATE INDEX "recipes_published_at_idx" ON "recipes" USING btree ("published_at");
    CREATE INDEX "recipes_updated_at_idx" ON "recipes" USING btree ("updated_at");
    CREATE INDEX "recipes_created_at_idx" ON "recipes" USING btree ("created_at");
    CREATE INDEX "recipes_gallery_order_idx" ON "recipes_gallery" USING btree ("_order");
    CREATE INDEX "recipes_gallery_parent_id_idx" ON "recipes_gallery" USING btree ("_parent_id");
    CREATE INDEX "recipes_gallery_image_idx" ON "recipes_gallery" USING btree ("image_id");
    CREATE INDEX "recipes_ingredients_order_idx" ON "recipes_ingredients" USING btree ("_order");
    CREATE INDEX "recipes_ingredients_parent_id_idx" ON "recipes_ingredients" USING btree ("_parent_id");
    CREATE INDEX "recipes_ingredients_product_idx" ON "recipes_ingredients" USING btree ("product_id");
    CREATE INDEX "recipes_method_order_idx" ON "recipes_method" USING btree ("_order");
    CREATE INDEX "recipes_method_parent_id_idx" ON "recipes_method" USING btree ("_parent_id");
    CREATE INDEX "recipes_method_image_idx" ON "recipes_method" USING btree ("image_id");

    -- ── Admin document locking ─────────────────────────────────────────
    -- Every collection joins this table; without these three columns the
    -- admin panel cannot take a lock on a row in any of them.
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vendor_applications_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chef_profiles_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "recipes_id" integer;

    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vendor_applications_fk" FOREIGN KEY ("vendor_applications_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chef_profiles_fk" FOREIGN KEY ("chef_profiles_id") REFERENCES "public"."chef_profiles"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recipes_fk" FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "payload_locked_documents_rels_vendor_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("vendor_applications_id");
    CREATE INDEX "payload_locked_documents_rels_chef_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("chef_profiles_id");
    CREATE INDEX "payload_locked_documents_rels_recipes_id_idx" ON "payload_locked_documents_rels" USING btree ("recipes_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Dropping the tables takes their own indexes, constraints and child rows
  // with them, so only the shared table and the enum types need naming.
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "vendor_applications_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "chef_profiles_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "recipes_id";

    DROP TABLE IF EXISTS "recipes_method" CASCADE;
    DROP TABLE IF EXISTS "recipes_ingredients" CASCADE;
    DROP TABLE IF EXISTS "recipes_gallery" CASCADE;
    DROP TABLE IF EXISTS "recipes" CASCADE;
    DROP TABLE IF EXISTS "chef_profiles_rels" CASCADE;
    DROP TABLE IF EXISTS "chef_profiles_qualifications" CASCADE;
    DROP TABLE IF EXISTS "chef_profiles_cuisines" CASCADE;
    DROP TABLE IF EXISTS "chef_profiles" CASCADE;
    DROP TABLE IF EXISTS "vendor_applications_rels" CASCADE;
    DROP TABLE IF EXISTS "vendor_applications_references" CASCADE;
    DROP TABLE IF EXISTS "vendor_applications_payment_terms" CASCADE;
    DROP TABLE IF EXISTS "vendor_applications_currencies" CASCADE;
    DROP TABLE IF EXISTS "vendor_applications_incoterms" CASCADE;
    DROP TABLE IF EXISTS "vendor_applications_certification_docs" CASCADE;
    DROP TABLE IF EXISTS "vendor_applications_certifications" CASCADE;
    DROP TABLE IF EXISTS "vendor_applications_temperature_regimes" CASCADE;
    DROP TABLE IF EXISTS "vendor_applications" CASCADE;

    DROP TYPE IF EXISTS "public"."enum_recipes_status";
    DROP TYPE IF EXISTS "public"."enum_recipes_difficulty";
    DROP TYPE IF EXISTS "public"."enum_recipes_cuisine";
    DROP TYPE IF EXISTS "public"."enum_recipes_course";
    DROP TYPE IF EXISTS "public"."enum_recipes_ingredients_unit";
    DROP TYPE IF EXISTS "public"."enum_chef_profiles_status";
    DROP TYPE IF EXISTS "public"."enum_chef_profiles_country";
    DROP TYPE IF EXISTS "public"."enum_chef_profiles_experience";
    DROP TYPE IF EXISTS "public"."enum_chef_profiles_kitchen_type";
    DROP TYPE IF EXISTS "public"."enum_chef_profiles_chef_role";
    DROP TYPE IF EXISTS "public"."enum_chef_profiles_cuisines";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_tier";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_status";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_how_heard";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_traceability";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_lead_time";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_country";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_preferred_contact";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_annual_turnover";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_employee_band";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_business_type";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_payment_terms";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_currencies";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_incoterms";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_certifications";
    DROP TYPE IF EXISTS "public"."enum_vendor_applications_temperature_regimes";

    -- Postgres cannot drop a value from an enum, so the type is rebuilt.
    -- Anyone holding chef or vendor is moved to customer first: roles is
    -- required, so deleting the rows outright could leave a user with none,
    -- which fails validation on their next save. Someone who already has
    -- customer simply loses the extra row rather than gaining a duplicate.
    DELETE FROM "users_roles" a
    WHERE a."value" IN ('chef', 'vendor')
      AND EXISTS (
        SELECT 1 FROM "users_roles" b
        WHERE b."parent_id" = a."parent_id" AND b."value" = 'customer'
      );

    UPDATE "users_roles" SET "value" = 'customer' WHERE "value" IN ('chef', 'vendor');

    ALTER TYPE "public"."enum_users_roles" RENAME TO "enum_users_roles__old";
    CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'fulfilment', 'customer');
    ALTER TABLE "users_roles"
      ALTER COLUMN "value" TYPE "public"."enum_users_roles"
      USING "value"::text::"public"."enum_users_roles";
    DROP TYPE "public"."enum_users_roles__old";
  `)
}
