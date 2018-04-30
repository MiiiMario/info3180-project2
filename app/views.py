"""
Flask Documentation:     http://flask.pocoo.org/docs/
Jinja2 Documentation:    http://jinja.pocoo.org/2/documentation/
Werkzeug Documentation:  http://werkzeug.pocoo.org/documentation/
This file creates your application.
"""

from app import app, db, login_manager
from flask import render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from forms import LoginForm, RegisterForm, UploadForm
from models import UserProfile, Posts, Likes, Follows 
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from passlib.hash import sha256_crypt
import gc, os, random,time, hashlib
from sqlalchemy import exc
from sqlalchemy import *
from functools import wraps
import random

###
# Routing for your application.
###



@app.route('/')
def index():
    """Display the homepage of the web application"""
    return render_template('index.html')

def token_required(funct):
    @wraps(funct)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]
            
        if not token:
            return jsonify({'message' : 'Token is missing, No Access!'}), 401

        try: 
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query.filter_by(username=data['cuser']).first()
        except:
            return jsonify({'message' : 'Token is invalid!'}), 401

        return funct(current_user, *args, **kwargs)
    return decorated


"""@@@@ API ROUTES @@@@""" 


@app.route('/api/auth/login', methods=["POST"])
def login():
    form = LoginForm()
    # Login and validate the user.
    if request.method == 'POST' and form.validate_on_submit():
        # Query our database to see if the username and password entered
        # match a user that is in the database.
        username = request.form["username"]
        password = request.form["password"]

        user = UserProfile.query.filter_by(username=username).first()
        if user is not None and check_password_hash(user.password, password):
            token = jwt.encode({'cuser': user.userid},app.config['SECRET_KEY'] , algorithm='HS256')
            login_user(user, remember=remember_me)
            return jsonify({'message': 'You are in!', 'user': user, 'jtoken':token})
        else:
            return jsonify({'message': 'Username or Password is incorrect.'})

    errors =form_errors(form)
    return jsonify({'errors' : errors})

@app.route("/api/auth/logout", methods =["GET"])
@token_required
def logout(current_user):
    # Logout the user and end the session
    
    logout_user()
    return jsonify('You have been logged out.')


@app.route('/api/users/register',methods=["POST"])
def register():
    
    form = RegisterForm()
    print 'yah so'
    if request.method =="POST":
        #if validate_uname(username):
        #     return jsonify({'message' : 'User already exists!'})
        ##f = form.profile_pic.data
        
        username = request.form['username']
        password = sha256_crypt.encrypt((str(request.form['password'])))
        firstname = request.form['fname']
        lastname = request.form['lname']
        email=request.form['email']
        biography= request.form['biography']
        location = request.form['location']

        
        #print (username, firstname, lastname, email, biography, location)
        photo = request.files['profile_photo']
        profilepic = secure_filename(photo.filename)
        joined_on =time.strftime("%a, %-d %b %Y")
        
        file_folder = app.config['UPLOAD_FOLDER']
        
        userid=randomnum('uid')    
        User = UserProfile(userid,username, password, firstname, lastname, email, biography, location, profilepic, joined_on)
        print User
        db.session.add(User)
        db.session.commit()
        # print User
        # if User:
        photo.save(os.path.join(file_folder, profilepic))
        return jsonify({'message' : 'Registration was a success!'})
            
    errors= form_errors(form)
    return jsonify({'errors': errors})
    
@app.route('/api/users/<user_id>/posts' ,methods=["GET"])
@token_required
def viewuserpage(current_user,user_id):
    if request.method == 'GET':
        """"View user profile info as well as all Posts by that user"""
        #user_id = request.args['user_id']
        User= User.query.filter_by(userid= user_id)
        if User:
            total_posts =User.query(func.count(Posts.post_id)/distinct(Posts.userid))##need to check query
            total_follwers =User.query(func.count(Follows.fid)/distinct(Follows.userid))
            
            userinfo,photos=[]
            userinfo.append(User.firstname,
               User.lastname,
               User.biography,
               User.location,
               User.profile_photo,
               User.joined_on,
               total_posts,total_follwers)
              
            userposts = Posts.query.filter_by(userid = user_id)
            for upost in userposts:
                
                photos.append(get_uploaded_images(upost.photo))        
                ### BRB!! my guess only retrieve the name since the actual photos are stored in the folder 
                ### {{ url_for('static', filename='img1.png') }}
            return jsonify({'userinfo':userinfo, 'photos':photos})
        return jsonify({'message' : 'User does not exist'})    
            
    return jsonify({'errors' : 'Method Invalid'})
    
        
    
@app.route('/api/users/<user_id>/posts' ,methods=["POST"])
@token_required
def add_posts(current_user,user_id):
    """Used for adding posts to the users feed"""
    
    pform = UploadForm()
    if request.method == 'POST' and pform.validate_on_submit():
        caption = pform.caption.data
        photo = pform.photo.data
        photoname = secure_filename(photo.filename)
        photo.save(os.path.join(app.config['UPLOAD_FOLDER'], photoname))
        ctime = time.strftime("%d %b %Y")
        posit = randomnum('pid')
        if Posts.query.filter(Posts.postid == posit):
            posit = randomnum()
        upost = Posts(postid =int(posit), userid =current_user.userid, photo =photoname ,caption =caption, date=ctime)
        db.session.add(upost)
        db.session.commit()
        return jsonify({'message' : 'Post Added!'})
   
    errors= form_errors(pform)
    return jsonify({'errors': errors})
  

    
@app.route('/api/users/<user_id>/follow', methods=["POST"])
@token_required
def follow(current_user,user_id):
    """Create a Follow relationship between the current user and the target user."""
    if request.method == "POST":
        #follee = request.get_json('user_id')
        if User.query.filter_by(userid= user_id):
            follow = Follows(userid =user_id, follower_id =current_user.userid)
            db.session.add(follow)
            db.session.commit()
            return jsonify({'message' :'You are now following'})
        return jsonify({'message' :'User doesnt exist..Try again'})
    return jsonify({'errors' : 'Method Invalid'})

@app.route('/api/posts/<post_id>/like', methods=['POST'])
@token_required
def like(current_user,post_id):
    if request.method == "POST":
        if User.query.filter_by(userid= user_id):
            like =Likes(randomnum('lid'), postid =post_id, userid= User.userid)
            db.session.add(like)
            db.session.commit()
            """Set a like on the current Post by the logged in User"""
            return jsonify({'message':'You Like the photo'})
        return jsonify({'message' :'User doesnt exist..Try again'})
    return jsonify({'errors' : 'Method Invalid'})
    
@app.route('/api/posts', methods=['GET'])
@token_required
def posts(current_user):
    if request.method == "GET":
        allposts ={}
        postss = Posts.query.all()
        print postss
        for post in postss:
            numlikes = len(Likes.query.order_by(Likes.postid).all()) 
            print numlikes
            if Posts.query.filter_by(post.userid== current_user.userid):
                likebyuser ="Yes"
            likebyuser ="No"
            u = UserProfile.query.filter_by(userid==post.userid )
            photo = get_uploaded_images(post.photo)
            uphoto = get_uploaded_images(post.profile_photo)
            allposts[post.postid] = {'photo':photo, 'caption' :post.caption, 'created_on' :post.created_on, 'likes': numlikes, 'likebyuser': likebyuser,'uname':u.username, 'uphoto':uphoto}
        """Return all posts for all users"""
        return jsonify({'allposts': allposts})
    return jsonify({'errors' : 'Method Invalid'})
    

""" API END""" 


# @login_manager.user_loader
# def load_user(id):
#     return UserProfile.query.get(int(id))


# Flash errors from the form if validation fails
def form_errors(form):
    error_messages = []
    """Collects form errors"""
    for field, errors in form.errors.items():
        for error in errors:
            message = u"Error in the %s field - %s" % (
                    getattr(form, field).label.text,
                    error
                )
            error_messages.append(message)

    return error_messages

def randomnum(ftype):
    ran = random.randrange(30000, 90000, 2)
    if ftype == "uid":
        if UserProfile.query.filter_by(userid=ran).first(): # try this line without the query it should work if it doesn't you can alway put it back.
            ran = random.randrange(30000, 90000, 5)
            return ran 
    elif ftype =="pid":
        if Posts.query.filter_by(postid=ran).first(): # try this line without the query it should work if it doesn't you can alway put it back.
            ran = random.randrange(30000, 90000, 5)
            return ran 
    elif ftype =="lid":
        if Likes.query.filter_by(lid=ran).first(): # try this line without the query it should work if it doesn't you can alway put it back.
            ran = random.randrange(30000, 90000, 5)
            return ran 
    elif ftype =="fid":
        if Follows.query.filter_by(fid=ran).first(): # try this line without the query it should work if it doesn't you can alway put it back.
            ran = random.randrange(30000, 90000, 5)
            return ran 
    return ran

def create_hash(password, hash_num):
    new_password = password + hash_num
    return hashlib.md5(new_password).hexdigest()
    

def get_uploaded_images(filename):
    rootdir = os.getcwd()
    for subdir, dirs, files in os.walk(rootdir + '/app/static/useruploads/'):
        for file in files:
            if file == filename:
                return os.path.join(subdir, file).split('/')[-1]


###
# The functions below should be applicable to all Flask apps.
###

@app.route('/<file_name>.txt')
def send_text_file(file_name):
    """Send your static text file."""
    file_dot_text = file_name + '.txt'
    return app.send_static_file(file_dot_text)


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also tell the browser not to cache the rendered page. If we wanted
    to we could change max-age to 600 seconds which would be 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


@app.errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port="8080")
#8080