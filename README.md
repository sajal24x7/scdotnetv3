Source code for sajalchoudhary.net

My website has these content buckets with the listed categories making up the bucket:
1. Notes - evergreen, now
2. Ephemera - micro, blog, photo, til
3. Fiction - poem, story
4. Newsletter - nordletter
5. Bookshelf - bookshelf

The content collection is stored in year folders under src/content. Never use constants to get the collection, instead get the list of years from the content folder and then get content from there.

## Section landing helper

Pages that render archive-style grids share a common `SectionLanding` configuration. Use `createSectionLandingProps` from `src/utils/sectionLanding.ts` to pull in the default layout, heading size, and padding tokens before applying route-specific overrides. This keeps section pages aligned and avoids duplicating the same prop blocks across the Garden and Stream surfaces.

## Layout container usage

The site-wide `Layout` component exposes a `pageWrapper` hook that forwards props to `LayoutContainer`. When page-level padding is needed, rely on the `padding` and `paddingScale` tokens defined on `LayoutContainer` instead of sprinkling Tailwind utility classes through `className`. Keep the wrapper neutral and push contextual spacing into inner surfaces (for example `SectionLanding` or dedicated content wrappers) so every route inherits the same structural frame.
