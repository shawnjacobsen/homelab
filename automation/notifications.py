# defines methods for alerting users of status changes, updates, errors, logging, etc.
import os, smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
load_dotenv()

# sendText('6143701557','Daily Tasks', 'Hello world!', 'Sprint')

# send text to phone number via sms and smtp
def sendText(phone_number, subject:str, body:str, carrier):
  # Define the email address and password of the sender
  sender_email = os.getenv("EMAIL_SENDER")
  sender_password = os.getenv("EMAIL_SENDER_PSW")

  # Define the recipient email address
  if carrier == "Sprint":
      recipient_email = phone_number + "@messaging.sprintpcs.com"
  else:
      print("Invalid carrier")
      exit()

  # create email message
  msg = MIMEMultipart()
  msg['From'] = sender_email
  msg['To'] = recipient_email
  msg['Subject'] = f"{subject}\n"
  msg.attach(MIMEText(f"{body}\n", 'plain'))

  # Create a server object and connect to the server
  context = ssl.create_default_context()
  with smtplib.SMTP_SSL('smtp.gmail.com',465, context=context) as smtp:
    smtp.login(sender_email, sender_password)
    smtp.sendmail(sender_email, recipient_email, msg.as_string())
