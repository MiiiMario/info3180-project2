from . import db
from werkzeug.security import generate_password_hash


class Users(db.Model):
    __tablename__ = 'users'
    userid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(255))
    firstname = db.Column(db.String(80))
    lastname = db.Column(db.String(80))
    email = db.Column(db.String(80))
    biography = db.Column(db.String(255))
    location =db.Column(db.String(80))
    profile_photo = db.Column(db.String(80))
   # hash_number = db.Column(db.String(180))
    joined_on = db.Column(db.DateTime())
    
    def __init__(self, userid, username, password, first_name, last_name, email, biography, location, profile_photo, joined_on):
        self.username = username
        self.password = generate_password_hash(password, method='pbkdf2:sha256')
        self.firstname = first_name
        self.lastname = last_name
        self.email = email
        self.biography = biography
        self.location = location
        self.profile_photo = profile_photo
        self.joined_on= joined_on
        self.userid = userid
        

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return '<User %r>' %  self.username
        
class Posts(db.Model):
    __tablename__ = 'posts'
    postid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, db.ForeignKey('users.userid'),nullable=False)
    photo = db.Column(db.String(255))
    caption =db.Column(db.String(255))
    created_on = db.Column(db.DateTime) 
    
    def __init__(self, postid, userid, photo, caption, date):
        self.postid =postid
        self.userid =userid
        self.photo = photo
        self.caption =caption
        self.created_on =date
    
    def __repr__(self):
        return '<Photo %r>' %  self.photo
    
    
    
class Likes(db.Model):
    __tablename__ = 'Likes'
    lid = db.Column(db.Integer, primary_key=True)
    userid =db.Column(db.Integer, db.ForeignKey('users.userid'),nullable=False)
    postid = db.Column(db.Integer, db.ForeignKey('posts.postid'),nullable=False)
    
    def __init__(self, lid, userid, postid):
        self.lid =lid
        self.userid =userid
        self.postid =postid
    
    def __repr__(self):
        return '<Likes %r>' %  self.lid
    
class Follows(db.Model):
    __tablename__ = 'Follows'
    fid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, db.ForeignKey('users.userid'),nullable=False)
    follower_id = db.Column(db.Integer, db.ForeignKey('users.userid'),nullable=False)
    
    
    def __init__(self, fid, userid,ffid):
        self.fid =fid
        self.userid =userid
        self.follower_id =ffid
        
    def __repr__(self):
        return '<Follows %r>' %  self.fid
        
        
        