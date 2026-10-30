// Student picked up during the registration flow (set by ERPVerify)
export const readStudentData = () => {
  try {
    return JSON.parse(sessionStorage.getItem('studentData'))
  } catch {
    return null
  }
}
