-- Add newsletter_opt_in to memberships table
alter table "public"."memberships" add column "newsletter_opt_in" boolean default false;
