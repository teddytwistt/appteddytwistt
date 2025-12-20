const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createAdminUser() {
  try {
    console.log('Creating admin user...')

    const { data, error } = await supabase.auth.admin.createUser({
      email: 'gonzalete@admin.com',
      password: 'Gonzalete123',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Gonzalete'
      }
    })

    if (error) {
      console.error('Error creating user:', error)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('Email: gonzalete@admin.com')
    console.log('Password: Gonzalete123')
    console.log('User ID:', data.user.id)
  } catch (err) {
    console.error('Exception:', err)
  }
}

createAdminUser()
