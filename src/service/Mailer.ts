import * as nodemailer from "nodemailer";

class Mailer {
  public mailer: nodemailer.Transporter;

  constructor(transport, options?) {
    this.mailer = nodemailer.createTransport(transport, options);
  }

  send(options: nodemailer.SendMailOptions) {
    return new Promise((accept, reject) => {
      this.mailer.sendMail(options, (err, info) => {
        if (err) {
          return reject(err);
        }

        return accept(info);
      });
    });
  }
}

export default Mailer;
