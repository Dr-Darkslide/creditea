// Funciones de Tiempos
function formatDate(d, separator, orden) {
	separator = separator || "/";
	orden =  orden || "dmY";
	  var dd = d.getDate();
	  if ( dd < 10 ) dd = '0' + dd;
	 
	  var mm = d.getMonth()+1;
	  if ( mm < 10 ) mm = '0' + mm;
	 
	  var yy = d.getFullYear();
	  if ( yy < 10 ) yy = '0' + yy;
	  
	 if(orden == "Ymd"){
		return yy+separator+mm+separator+dd;
	 } else {
		return dd+separator+mm+separator+yy;
	 }
}

function hora(fecha) {
	var hora = fecha.getHours();
	var minuto = fecha.getMinutes();
	var segundo = fecha.getSeconds();
	if (hora < 10) {hora = "0" + hora}
	if (minuto < 10) {minuto = "0" + minuto}
	if (segundo < 10) {segundo = "0" + segundo}
	var horita = hora + ":" + minuto + ":" + segundo
	return horita;
}

function calcular_edad(fecha) {
    hoy=new Date()
    var array_fecha = fecha.split("/")
    if (array_fecha.length!=3){
	    array_fecha = fecha.split("-");
		if (array_fecha.length!=3){
			return false
		}
	}
    var ano
    ano = parseInt(array_fecha[2]);
    if (isNaN(ano))
       return false	
    var mes
    mes = parseInt(array_fecha[1]);
    if (isNaN(mes))
       return false
    var dia
    dia = parseInt(array_fecha[0]);
    if (isNaN(dia))
       return false	   
	if(ano <= 31){
		 ano = parseInt(array_fecha[0]);
		 dia = parseInt(array_fecha[2]);
	}
    if (ano<=99)
       ano +=1900
	var anohoy = hoy.getFullYear();
    edad= anohoy - ano - 1; //-1 porque no se si ha cumplido años ya este año
    if (hoy.getMonth() + 1 - mes < 0) //+ 1 porque los meses empiezan en 0
       return edad
    if (hoy.getMonth() + 1 - mes > 0)
       return edad+1
    if (hoy.getUTCDate() - dia >= 0)
       return edad + 1
    return edad
}

function existeFecha(fecha) {
      var dtCh= "/";
	var minYear=1900;
	var maxYear=2100;
	function isInteger(s){
		var i;
		for (i = 0; i < s.length; i++){
			var c = s.charAt(i);
			if (((c < "0") || (c > "9"))) return false;
		}
		return true;
	}
	function stripCharsInBag(s, bag){
		var i;
		var returnString = "";
		for (i = 0; i < s.length; i++){
			var c = s.charAt(i);
			if (bag.indexOf(c) == -1) returnString += c;
		}
		return returnString;
	}
	function daysInFebruary (year){
		return (((year % 4 == 0) && ( (!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28 );
	}
	function DaysArray(n) {
		for (var i = 1; i <= n; i++) {
			this[i] = 31
			if (i==4 || i==6 || i==9 || i==11) {this[i] = 30}
			if (i==2) {this[i] = 29}
		}
		return this
	}
	function isDate(dtStr){
		var daysInMonth = DaysArray(12)
		var pos1=dtStr.indexOf(dtCh)
		var pos2=dtStr.indexOf(dtCh,pos1+1)
		var strDay=dtStr.substring(0,pos1)
		var strMonth=dtStr.substring(pos1+1,pos2)
		var strYear=dtStr.substring(pos2+1)
		strYr=strYear
		if (strDay.charAt(0)=="0" && strDay.length>1) strDay=strDay.substring(1)
		if (strMonth.charAt(0)=="0" && strMonth.length>1) strMonth=strMonth.substring(1)
		for (var i = 1; i <= 3; i++) {
			if (strYr.charAt(0)=="0" && strYr.length>1) strYr=strYr.substring(1)
		}
		month=parseInt(strMonth)
		day=parseInt(strDay)
		year=parseInt(strYr)
		if (pos1==-1 || pos2==-1){
			return false
		}
		if (strMonth.length<1 || month<1 || month>12){
			return false
		}
		if (strDay.length<1 || day<1 || day>31 || (month==2 && day>daysInFebruary(year)) || day > daysInMonth[month]){
			return false
		}
		if (strYear.length != 4 || year==0 || year<minYear || year>maxYear){
			return false
		}
		if (dtStr.indexOf(dtCh,pos2+1)!=-1 || isInteger(stripCharsInBag(dtStr, dtCh))==false){
			return false
		}
		return true
	}
	if(isDate(fecha)){
		return true;
	}else{
		return false;
	}
}
//Fin Funciones de Tiempos

// Funcion Moneda
function formatMoney(n, c, d, t) {
	var n = n == undefined ? 0: (isNaN(n) ? n.replace(/,/g,""):n), 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };
// Fin Funcion Moneda

function crearTablas(db){
	db.transaction(function(tx) {
		tx.executeSql("SELECT COUNT(1) FROM DEPARTAMENTO", [],function(tx, results){//
			console.log('Tablas ya creadas.');
		},function(tx){
			console.log('Inicio de creacion y poblacion de tablas.');
			tx.executeSql("CREATE TABLE IF NOT EXISTS LOGS(ID_LOG INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,TAREA TEXT,FECHA TEXT)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS USERLOGIN(NOMBRE text DEFAULT '',NOMBRE_COMPLETO TEXT DEFAULT '',PASS text DEFAULT '',USERID text DEFAULT '',ROLENAME text DEFAULT '',COMPANYNAME text DEFAULT '',COMPANYID text DEFAULT '',COMPANYPLACE text DEFAULT '',LOGEADO text,MENSAJE text, FECHAMENSAJE text)", [],function(tx, results){
				tx.executeSql("INSERT INTO USERLOGIN(LOGEADO) VALUES('N')");
			});
			tx.executeSql("CREATE TABLE IF NOT EXISTS NOTAS(ID_NOTA INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,NOTA TEXT,USER_ID INTEGER)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS SINCRONIZACIONES(ID_SINCRO INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,PERFILES TEXT,SOLICITUDES TEXT,IMAGENES TEXT,USER_ID INTEGER,FECHA_SINCRO TEXT)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS CAP_CUSTOMER(ID_CAP_CUSTOMER INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,AGENCIA INTEGER, FIRSTNAME TEXT, MIDNAME TEXT, LASTNAME1 TEXT,LASTNAME2 TEXT,TYPE_IDENTITY INTEGER,IDENTITY TEXT,GENDER INTEGER,BIRTHDAY TEXT,STATUS INTEGER,NATIONALITY TEXT,OCUPATION INTEGER,EDUCATION INTEGER,PATRIMONY REAL,ACTIVE INTEGER,DATE_CREATED TEXT,DATE_UPDATED TEXT,ID_SERVER INTERGER, CREDITO text)", [],function(tx, results){
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('ERICK', 'EDGARDO','PINEDA','BATRES','EXTRAFINANCIAMIENTO')");
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('HENRY', ' ','RAMIREZ','DEVANY','CREDITO AGRICOLA')");
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('JORGE', 'ANTONIO','PEREZ','VILLEDA','CREDITO PARA INMUEBLES')");
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('CARLOS', '','MARTINEZ',' ','CREDITO PARA FLOTA DE VEHICULOS')");
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('JUAN', 'EDGARDO','MONTANO','','CREDITO DE CAPITAL')");
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('MIGUEL', ' ','VOCE','','EXTRAFINANCIAMIENTO')");
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('ANTONIO', ' ','PEREZ',' ','CREDITO CAPITAL')");
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('ANA', ' ','GUEVARA',' ','CREDITO CAPITAL')");
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('JOSEFINA', ' ','POCASANGRE',' ','EXTRAFINANCIAMIENTO')");
				tx.executeSql("INSERT INTO CAP_CUSTOMER(FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, CREDITO) VALUES('MARIA', '','VARELA',' ','CREDITO PARA INMUEBLES')");
			});
			tx.executeSql('CREATE INDEX IF NOT EXISTS index_cap_customer_id_cap_customer_idx on CAP_CUSTOMER (ID_CAP_CUSTOMER)');
			tx.executeSql('CREATE INDEX IF NOT EXISTS index_cap_customer_firstname_idx on CAP_CUSTOMER (FIRSTNAME)');
			tx.executeSql('CREATE INDEX IF NOT EXISTS index_cap_customer_lastname_idx on CAP_CUSTOMER (LASTNAME1)');
			tx.executeSql("CREATE TABLE IF NOT EXISTS FORMULARIOS(ID_FORMULARIO integer NOT NULL PRIMARY KEY AUTOINCREMENT,NOMBRE text,ID_DIV text NOT NULL,HTML text,FECHA_SINCRO text)", [],function(tx, results){
				tx.executeSql("INSERT INTO FORMULARIOS(NOMBRE,ID_DIV,HTML) VALUES('Formulario Datos Clientes', 'div_datosGenerales','<div id=\"genfiel\" data-role=\"collapsible\" data-collapsed=\"false\"> <h4>Datos generales</h4><br> <label for=\"Nombres\" class=\"label\">Nombres: </label><input type=\"text\" name=\"\" id=\"\" class=\"input-perfil\"> <label for=\"Apellidos\" class=\"label\">Apellidos: </label> <input type=\"text\" name=\"\" id=\"\" class=\"input-perfil\"> </div><div id=\"genfiel2\" data-role=\"collapsible\" data-collapsed=\"false\"><h4>Datos de ubicación</h4><label for=\"Departamentos\" class=\"label\">Departamento: </label> <select id=\"\" name=\"\" class=\"input-perfil\"> <option value=\"\">San Salvador </option> </select> <label for=\"Municipio\" class=\"label\">Municipio: </label> <select id=\"\" name=\"\" class=\"input-perfil\"> <option value=\"\">San Salvador </option> </select></div><div id=\"genfie2\" data-role=\"collapsible\" data-collapsed=\"false\"><h4>Necesidad de Financiamiento</h4><label for=\"Tipos de crédito\" class=\"label\">Tipos de crédito: </label><input type=\"text\" name=\"\" id=\"\" class=\"input-perfil\"> <label for=\"Monto\" class=\"label\">Monto: </label> <input type=\"text\" name=\"\" id=\"\" class=\"input-perfil\"> <label for=\"Plazo\" class=\"label\">Plazo: </label> <input type=\"text\" name=\"\" id=\"\" class=\"input-perfil\"></div> <div id=\"genfie3\" data-role=\"collapsible\" data-collapsed=\"false\"><h4>Datos de usuario</h4><br> <label for=\"Email\" class=\"label\">Email: </label><input type=\"email\" name=\"\" id=\"\" class=\"input-perfil\"> <label for=\"Email\" class=\"label\">Telefono: </label><input type=\"email\" name=\"\" id=\"\" class=\"input-perfil\"> <label for=\"Email\" class=\"label\">Celular: </label><input type=\"email\" name=\"\" id=\"\" class=\"input-perfil\"> <label for=\"Email\" class=\"label\">Dirección: </label><input type=\"email\" name=\"\" id=\"\" class=\"input-perfil\"></div>')");
				tx.executeSql("INSERT INTO FORMULARIOS(NOMBRE,ID_DIV) VALUES('Formulario Solicitud de Credito', 'div_datosCreditos')");
			});
			tx.executeSql("CREATE TABLE IF NOT EXISTS GARANTIAS(ID integer NOT NULL PRIMARY KEY AUTOINCREMENT, ID_SOL INTEGER DEFAULT 0,ID_GAR integer, STATE integer DEFAULT 0,ID_USER INTEGER,ELIMINADA INT DEFAULT 0,DATE_CREATED text)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS STORAGE(ID integer NOT NULL PRIMARY KEY AUTOINCREMENT, CUSTOMER_REQUESTS integer DEFAULT 0,FORM integer, SUB_FORM integer DEFAULT 0, FORM_PROD INTEGER DEFAULT 0, FORM_RESPONSE text,DATE_CREATED text,DATE_UPDATED text,ID_DIV text NOT NULL, ID_FORM_SERVER INTERGER, ID_FORM_SERVER_R INTEGER, COD_SESS text)");
			tx.executeSql('CREATE INDEX IF NOT EXISTS index_storage_customer_requests_idx on STORAGE (CUSTOMER_REQUESTS)');
			tx.executeSql('CREATE INDEX IF NOT EXISTS index_storage_form_response_idx on STORAGE (FORM_RESPONSE)');
			
			tx.executeSql("CREATE TABLE IF NOT EXISTS DEPARTAMENTO(ID_DEP integer NOT NULL, CODE integer,NOMBRE text)", [],function(tx, results){
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(1, 1, 'AHUACHAPAN')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(2, 2, 'SANTA ANA')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(3, 3, 'SONSONATE')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(4, 4, 'CHALATENANGO')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(5, 5, 'CUSCATLAN')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(6, 6, 'SAN SALVADOR')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(7, 7, 'LA LIBERTAD')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(8, 8, 'SAN VICENTE')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(9, 9, 'LA PAZ')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(10, 10, 'CABAÑAS')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(11, 11, 'USULUTAN')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(12, 12, 'SAN MIGUEL')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(13, 13, 'MORAZAN')");
				tx.executeSql("INSERT INTO DEPARTAMENTO(ID_DEP,CODE,NOMBRE) VALUES(14, 14, 'LA UNION')");
			});
			tx.executeSql("CREATE TABLE IF NOT EXISTS MUNICIPIO(ID_MUN integer NOT NULL,CODE integer,NOMBRE text,ID_DEP integer)", [],function(tx, results){
				tx.executeSql("INSERT INTO MUNICIPIO(ID_MUN,ID_DEP,CODE,NOMBRE) VALUES(1, 1, 2, 'EL PORVENIR')");
				
			});
		});
	},
	onError,
	function(){
		db.transaction(function(tx){
			tx.executeSql("SELECT ID_DIV,HTML,(SELECT MAX(strftime('%d/%m/%Y %H:%I:%S',FECHA_SINCRO)) FROM SINCRONIZACIONES) FECHA_SINCRO FROM FORMULARIOS ORDER BY ID_FORMULARIO", [],function(tx, results){//
				var fechaSincro = results.rows.item(0).FECHA_SINCRO;
				if(fechaSincro != null){
					fechaSincronizacion = fechaSincro;
					$('#sp_fec_sincronizacion').html(fechaSincronizacion);
					$('#sp_fec_sincronizacion2').html(fechaSincronizacion);
				} else {
					console.log('No hay fecha de sincronizacion');
				}
				var len = results.rows.length;
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					console.log('Construccion del div:'+row['ID_DIV']);
					if(row['HTML'] != null){
						$('#'+row['ID_DIV']).empty();
						$('#'+row['ID_DIV']).html(row['HTML']);
						$('#'+row['ID_DIV']+' div').collapsible();
						$('#'+row['ID_DIV']+' select').selectmenu();
						$('#'+row['ID_DIV']+' input[type!="button"]').textinput();
						$('#'+row['ID_DIV']+' :button').button();
						console.log('Se cargo el html para el div:'+row['ID_DIV']);
					}else
						console.log('No se encontro html para el div:'+row['ID_DIV']);
				}//fin for
			});
    	},function(){},//error
    	function(){//exito
			$.mobile.loading( "show", {
				  textVisible: true,
				  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
			});
    		db.transaction(function(tx){
	    		tx.executeSql("SELECT * FROM USERLOGIN", [],function(tx, results){//
					if(results.rows.length > 0) {
						//si LOGEADO es N, no hacer nada
						if(results.rows.item(0).LOGEADO == 'S'){
							userLoginGlobal = new UserLogin();
							userLoginGlobal.setNombre(results.rows.item(0).NOMBRE);
							userLoginGlobal.setPass(results.rows.item(0).PASS);
							userLoginGlobal.setUserid(results.rows.item(0).USERID);
							userLoginGlobal.setRolename(results.rows.item(0).ROLENAME);
							userLoginGlobal.setCompanyName(results.rows.item(0).COMPANYNAME);
							userLoginGlobal.setCompanyId(results.rows.item(0).COMPANYID);
							userLoginGlobal.setCompanyPlace(results.rows.item(0).COMPANYPLACE);
							userLoginGlobal.setNombreCompleto(results.rows.item(0).NOMBRE_COMPLETO);
							
							$('#sp_mensaje').html(results.rows.item(0).MENSAJE);
							$('#fh_publicacion').html(results.rows.item(0).FECHAMENSAJE);
							
							if(results.rows.item(0).ROLENAME == "admonGears"){
								$('#div_btn_formDinamicos').show();
								$('#div_btn_datosSincro').hide();
								$('#btn_sincro').hide();
							}else{
								$('#div_btn_formDinamicos').hide();
								$('#div_btn_datosSincro').show();
								$('#btn_sincro').show();
							}
							$('.lblUser').html(results.rows.item(0).USERID);
							$.mobile.loading("hide");
							irOpcion('principal');
						}
					}
	    		});
    		},function(){ $.mobile.loading("hide"); }, function(){ $.mobile.loading("hide"); });
    	}//fin exito
    	);
	});
}

function onError(err){
	quitarLoad();
	alert('Error: '+err.code+" - "+err.message);
	console.log('Error: '+err.code+" - "+err.message);
}

