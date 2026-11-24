import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Aromire-Éko')
    .items([
      S.listItem()
          .title('Site')
        .child(
            S.list()
              .title('Site')
              .items([
                S.listItem()
                  .title('Site settings')
                  .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
                S.documentTypeListItem('aboutPage').title('About page'),
                S.listItem()
                  .title('Partners')
                  .child(S.documentTypeList('partner').title('Partners').defaultOrdering([{field: 'sortOrder', direction: 'asc'}])),
                S.documentTypeListItem('pillar').title('Pillars'),
              ]),
        ),
        S.listItem()
          .title('Programs')
          .child(
            S.list()
              .title('Programs')
              .items([
                S.listItem()
                  .title('All programs')
                  .child(S.documentTypeList('program').title('All programs').defaultOrdering([{field: 'startDate', direction: 'desc'}])),
                S.divider(),
                S.listItem()
                  .title('Published')
                  .child(
                    S.documentTypeList('program')
                      .title('Published programs')
                      .filter('status == "published" && isSample != true')
                      .defaultOrdering([{field: 'startDate', direction: 'desc'}])
                  ),
                S.listItem()
                  .title('Drafts')
                  .child(
                    S.documentTypeList('program')
                      .title('Draft programs')
                      .filter('status == "draft"')
                      .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                  ),
                S.divider(),
                S.listItem()
                  .title('Locations')
                  .child(S.documentTypeList('location').title('Locations').defaultOrdering([{field: 'name', direction: 'asc'}])),
                S.listItem()
                  .title('Testimonials')
                  .child(S.documentTypeList('testimonial').title('Testimonials').defaultOrdering([{field: '_createdAt', direction: 'desc'}])),
              ]),
          ),
        S.listItem()
          .title('Blog')
          .child(
            S.list()
              .title('Blog')
              .items([
                S.listItem()
                  .title('Posts')
                  .child(S.documentTypeList('post').title('Posts').defaultOrdering([{field: 'publishedAt', direction: 'desc'}])),
                S.documentTypeListItem('category').title('Categories'),
                S.documentTypeListItem('author').title('Authors'),
              ]),
          ),
    ])
