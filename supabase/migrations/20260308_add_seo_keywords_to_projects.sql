-- Add persisted SEO keywords for dynamic metadata generation
alter table public.projects
add column if not exists seo_keywords text[] not null default '{}';

comment on column public.projects.seo_keywords is
  'Auto-generated SEO keywords used in Next.js metadata keywords output.';

alter table public.projects
add column if not exists listing_city text;

update public.projects
set listing_city = case
  when lower(concat_ws(' ', city, city_slug)) like '%bangalore%'
    or lower(concat_ws(' ', city, city_slug)) like '%bengaluru%' then 'bangalore'
  when lower(concat_ws(' ', city, city_slug)) like '%vizag%'
    or lower(concat_ws(' ', city, city_slug)) like '%visakhapatnam%' then 'vizag'
  when lower(concat_ws(' ', city, city_slug)) like '%vijayawada%'
    or lower(concat_ws(' ', city, city_slug)) like '%amaravati%'
    or lower(concat_ws(' ', city, city_slug)) like '%guntur%' then 'vijayawada'
  else 'hyderabad'
end
where listing_city is null;

update public.projects
set city_slug = listing_city
where city_slug is null
  or city_slug not in ('hyderabad', 'bangalore', 'vizag', 'vijayawada');

alter table public.projects
alter column listing_city set default 'hyderabad',
alter column listing_city set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_listing_city_check'
  ) then
    alter table public.projects
      add constraint projects_listing_city_check
      check (listing_city in ('hyderabad', 'bangalore', 'vizag', 'vijayawada'));
  end if;
end $$;
