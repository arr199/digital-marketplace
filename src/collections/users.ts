import { type CollectionConfig } from 'payload/types'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: {
      generateEmailHTML: ({ token }) => {
        return `
        <div>
          <h1>Verify the email</h1>
          <p>Click the link below in order to proceed.</p>
          </br>
          <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}">Verify here!</a>
         </div>`
      }
    }

  },

  access: {
    read: () => true,
    create: () => true
  },
  fields: [
    {
      name: 'role',
      defaultValue: 'user',
      required: true,
      admin: {
        condition: () => false
      },
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' }]

    }
  ]
}
