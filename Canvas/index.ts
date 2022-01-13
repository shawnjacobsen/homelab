require('dotenv').config()
import { getCurrentSemesterClasses } from './Queries'

export default async () => {
  
  await getCurrentSemesterClasses()
}