const loginApi = async () => {
  const identifier = process.env.STRAPI_IDENTIFIER
  const password = process.env.STRAPI_PASSWORD
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier,
      password
    }),
  }
  console.log('loginApi', { options })
  const { jwt, user, ...rest } = await fetch(process.env.STRAPI_URL + '/auth/local', options).then(res => {
    return res.json()
  })
  return { jwt, user, ...rest }
}
const sendContactApi = async (req, jwt) => {
  const { query = {} } = req
  let text = req.body.text;
  
  console.log('text', text);
  const body = JSON.stringify({
    to: process.env.STRAPI_EMAIL_TO || "hieunguyenel@gmail.com",
    subject: 'need some help from mobelaris',
    text
  })
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + jwt
  }
  const result = await fetch(process.env.STRAPI_URL + '/email', {
    method: 'POST',
    headers,
    body,
  }).then(res => {
    return res.json()
  })
  console.log({ result })
  const { error, message = 'system error' } = result
  if (error) {
    throw new Error(message)
  }
}

export default async function contact(req, res) {
  // Exit the current user from "Preview Mode". This function accepts no args.
  // Redirect the user back to the index page.  

  try {
    const { jwt, user, ...rest } = await loginApi()
    console.log({ user, jwt, ...rest })
    if (!jwt) {
      throw new Error("login failed")
    }
    console.log('login success')
    if (jwt) {
      await sendContactApi(req, jwt)
      console.log('sent contact successfully');
    }
  } catch (error) {
    console.error(error)
  }

  res.status(200).json({message: 'The email was sent successfully!'});
  res.end()
}