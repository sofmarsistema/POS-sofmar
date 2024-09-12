import {createClient} from '@supabase/supabase-js'



const supabaseUrl = 'https://mwjeyvhpyulgczpqxgtb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13amV5dmhweXVsZ2N6cHF4Z3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU4OTU5NDksImV4cCI6MjA0MTQ3MTk0OX0.HKoJXsJKh-0L3uzwz-uATxvV1MzUR3NUfX_NJvlVmQU'

export const supabase = createClient(supabaseUrl, supabaseKey)

