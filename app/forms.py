from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField,ValidationError,SubmitField
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms.validators import DataRequired, Email, EqualTo
from .models import Users


class RegisterForm(FlaskForm):
    fname = StringField('First Name', validators=[DataRequired()])
    lname = StringField('Last Name', validators=[DataRequired()])
    email = StringField('Email', validators=[Email()])
    biography= StringField('Biography', validators = [DataRequired()])
    location = StringField('Location', validators = [DataRequired()])
    profile_photo = FileField('Profile Picture', validators=[
        FileRequired(),
        FileAllowed(['jpg', 'jpeg','png'], 'Images only!')
    ])
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('New Password', validators=[DataRequired(),
        EqualTo('confirmpassword', message='Passwords must match')
    ])
    confirmpassword = PasswordField('Confirm Password')
    

def validate_email(self,field):
    if Users.query.filter_by(email=field.data).first():
        raise ValidationError('That email address is in use.')

def validate_uname(self,field):
    if Users.query.filter_by(username=field.data).first():
        raise ValidationError('That username is already in use.')
        
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    


class UploadForm(FlaskForm):
    photo = FileField('Browse', validators=[FileRequired(), FileAllowed(['jpg', 'png', 'jpeg'], 'Images only!')])
    caption = StringField('Caption', validators=[DataRequired()])
    