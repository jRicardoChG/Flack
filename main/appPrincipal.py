import requests
import os
import json

from funciones          import organizar
from flask              import Flask, session,render_template,request,jsonify
from flask_session      import Session
from flask_socketio     import SocketIO, emit

###########################################CODIGO CONFIGURACION###############################################################
app = Flask(__name__)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
# confiugrar socketio
app.config["SECRET_KEY"] = "secretisima!"
socketio = SocketIO(app)
###############################################################################################################

@app.route("/",methods=["GET","POST"])
def pagPrincipal():
    if request.method == "POST":
        mensaje = request.form.get("saludo")
        print("lo uqe recibi",mensaje)
        return jsonify({"respuesta":"te he respondido","texto":mensaje})
    return render_template("home.html")

@socketio.on("socketMessage")
def socket(datos):
    selection = datos["seleccion"]
    print(selection)
    emit("mensajeServer",{"seleccion":selection},broadcast=True)

if __name__ == '__main__':
    socketio.run(app)