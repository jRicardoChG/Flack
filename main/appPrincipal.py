import requests
import os
import json

from funciones          import organizar
from flask              import Flask, session,render_template,request,jsonify
from flask_session      import Session

###########################################CODIGO CONFIGURACION###############################################################
app = Flask(__name__)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
###############################################################################################################

@app.route("/",methods=["GET","POST"])
def pagPrincipal():
    if request.method == "POST":
        mensaje = request.form.get("saludo")
        print("lo uqe recibi",mensaje)
        return jsonify({"respuesta":"te he respondido","texto":mensaje})
    return render_template("home.html")


