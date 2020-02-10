'use strict'

const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        'emails.forgot_password',
        {
          email,
          token: user.token,
          link: ` http://www.meusistema.com/resetar_senha?token=${user.token}`
        },
        message => {
          message
            .to(user.email)
            .from('jgmp@me.com')
            .subject('Recuperação de senha')
        }
      )
    } catch (error) {
      return response
        .status(error.status)
        .send({ error: { message: 'Algo deu errado, esse email existe?' } })
    }
  }

  async update({ request, response }) {
    try {
      const { token, password } = request.all()
    } catch (error) {
      return response
        .status(error.status)
        .send({ error: { message: 'Algo deu errado ao resetar a sua senha' } })
    }
  }
}

module.exports = ForgotPasswordController
