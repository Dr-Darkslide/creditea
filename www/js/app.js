var app = {};
app.webdb = {};
app.creditea = {};
app.webdb.db = null;
var inputGlobal1, inputGlobal2; //para almacenar los input actuales 
var clientGlobal;
var userLoginGlobal;
var fechaSincronizacion;//variable donde se almacenara la ultima fecha la cual fue sincronizado
//para saber a que pagina irse o donde esta actualmente;
//1: datos del cliente
var paginaActual = 0;
//variables globales para almacenas los json de las sincronizacion
var jsonPerfilGlobal = '';
var jsonFormulariosGlobal = '';
//--------------------------------------------------------
//Funcion de arranque
//--------------------------------------------------------
app.initialize = function() {
	app.bindEvents();
	app.initFastClick();
};

app.bindEvents = function() {    
    $(document).bind("pageinit", function() {
		$.mobile.ajaxEnabled = false;
		$.support.cors = true;
		$.mobile.phonegapNavigationEnabled = false;
	    $.mobile.allowCrossDomainPages = false;
	    $.mobile.ajaxLinksEnabled = false;
	    $.mobile.defaultPageTransition = "none";
	    $.mobile.orientationChangeEnabled = false;
	    if(sinRepeticion == 0){
		    //document.addEventListener('deviceready', app.onDeviceReady, false);
		    app.onDeviceReady(); //para navegador
		    sinRepeticion = 1;
	    }
	});
};

app.initFastClick = function() {
    window.addEventListener('load', function() {
        FastClick.attach(document.body);
    }, false);
};

app.onDeviceReady = function() {
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});

	//Abrimos la base
	app.webdb.abrir();
	//Creamos Tablas
	app.webdb.crear_tablas();
	//Mostramos Ultima Sincronizacion
	getUltimaSincronizacion();
	//salir cuando se presione el boton atras en el cel
	document.addEventListener("backbutton", function(){
        navigator.notification.confirm(
        		'\xbfDesea salir de la aplicaci\xf3n?', // message
        		function(indexButton){// callback to invoke with index of button pressed
        			if(indexButton == 1){
        				navigator.app.exitApp();
        			}
        		},
                'Aviso',           // title
                ['Si','No']         // buttonLabels
            );
	}, false);
	//funciones cuando este en pause
	document.addEventListener("pause", function(){
		console.log('app entra en pause.');
	}, false);	
	$.mobile.loading("hide");
};

//--------------------------------------------------------
function app_log(tarea)
{
	//app.webdb.abrir();
	var db = app.webdb.db;
	if(db !== null){
		db.transaction(function(tx){
			tx.executeSql("INSERT INTO LOGS(TAREA,FECHA) VALUES(?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'))",[tarea]);
		});
	}
	console.log(tarea);
}

function isActiveConnection() 
{
	if(typeof navigator.connection == 'undefined'){
		return true;
	} else {
		var networkState = navigator.connection.type;
		var ret;

		if(networkState == Connection.NONE) {
			ret = false;
		} else {
			if(networkState == Connection.WIFI) {
				
			} else {
				
			}
			ret = true;
		}
		return ret;
	}
}

function inicialLogin() 
{
	var db = app.webdb.db;
	if($('#txt_user').val().trim().length == 0){
		$('#txt_user').css('border','1px solid red');
		alert("El Usuario es requerido.");
		return;
	}else{
		$('#txt_user').css('border','0px none rgb(51, 51, 51)');
	}
	if($('#txt_pass').val().trim().length == 0){
		$('#txt_pass').css('border','1px solid red');
		alert("La Contrase\u00f1a es requerida.");
		return;
	}else{
		$('#txt_pass').css('border','0px none rgb(51, 51, 51)');
	}
	var db = app.webdb.db;
	// recolecta los valores que inserto el usuario
	var datosUsuario = $("#txt_user").val()
	var datosPassword = $("#txt_pass").val()
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
	if(!isActiveConnection()) {
		$.mobile.loading("hide");
		alert('Para iniciar sesión debe tener conexión activa a Internet');
	} else {
		$.mobile.loading("hide");
		if (datosUsuario == "demo" && datosPassword == "demo") {
			userLoginGlobal = new UserLogin();
			userLoginGlobal.setNombre(datosUsuario);
			userLoginGlobal.setPass(datosPassword);
			userLoginGlobal.setUserid("demo");
			userLoginGlobal.setRolename("Mentor");
			userLoginGlobal.setCompanyName("Creditea");
			userLoginGlobal.setCompanyId("1");
			userLoginGlobal.setCompanyPlace("Creditea SV");
			userLoginGlobal.setNombreCompleto("Usuarios Demostracion");
			//----registrar que el user esta logeado
			db.transaction(function(tx){
				tx.executeSql("UPDATE USERLOGIN SET NOMBRE = ?,NOMBRE_COMPLETO = ?, PASS = ?,USERID = ?,ROLENAME = ?,COMPANYNAME = ?,COMPANYID = ?,COMPANYPLACE = ?,LOGEADO = 'S',MENSAJE = ?",[datosUsuario,"Usuario demostracion",datosPassword,"demo","Mentor","Creditea","1","Creditea SV","Bienvenidos"]);
			});
			//--------------------------------------
			//console.log(respuestaServer.rolename);		
			$('.lblUser').html("demo");
			$('#txt_pass').val('');
			irOpcion('principal');
		} else {
			alert("Error a loguearse");
		}
	}
}
//--------------------------------------------------------
//Abrir BD
//--------------------------------------------------------
app.webdb.abrir = function() {
	var dbSize = 250 * 1024 * 1024; // 25MB
	app.webdb.db = openDatabase("CrediteaDB", "1.0", "Datos para creditea", dbSize);
};
//crear la tablas si existen
app.webdb.crear_tablas = function(){
	var db = app.webdb.db;
	crearTablas(db);//esta funcion  se encuentra el app_complemnto
};

//-------------------------------------
//MENSAJE DE ERROR
//-------------------------------------+
app.webdb.onError = function(err){
	quitarLoad();
	app_log(err.code+" - "+err.message);
	alert('Error: '+err.code+" - "+err.message);	
};

app.creditea.verificarLogin = function(direct) {
	var valid = true;
	if(typeof userLoginGlobal == 'undefined'){
		if(direct == 'undefined')
			return  false; 
		else {
			$.mobile.changePage($('#pag_login'));
		}
	} else {
		if(userLoginGlobal.userid == undefined){
			if(direct == 'undefined')
				return  false; 
			else {
				$.mobile.changePage($('#pag_login'));
			}
		} else {
			return true;
		}
	}
}

function cambiarPagina(idPagina)
{
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
	cargarLabelPrincipal(idPagina);
	$.mobile.changePage($('#pag_'+idPagina));
	$.mobile.loading("hide");
}

function quitarLoad()
{
	$.mobile.loading("hide");
}

function alertDismissed()
{
    // do something
}

function limpiarForm(idDiv)
{
	//proceso de limpiar el formulario
	$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
		$(input).css({'background-color':'white' , "color":"black"});
		$(input).val("");
	});
	$.each($('#'+idDiv+' select'), function(index, select){
		//$(select).parent().css({"background-color":"#009245"});
		$(select).val($(select).children('option:first').val());
		$(select).selectmenu('refresh');
	});
	$.each($('#'+idDiv+' textarea'), function(index, input){
		$(input).css('background-color','white');
		$(input).val("");
	});
	$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
		$(input).attr("src","");
	});
	$.each($('#'+idDiv+' input[type="checkbox"]'), function(index, input){
		$(input).attr('checked',false).checkboxradio('refresh');
	});
	if ($('#'+idDiv).parent().find('input[id^="editForm"]').length){
		$('#'+idDiv).parent().find('input[id^="editForm"]').val(0);
	}
	//limpiamos el review de los creditos
	if(idDiv == 'div_datosCreditos'){
		$("#tbl_cred_garan_fiduciarios").html("");
		$("#tbl_cred_garan_fiduciarios").parent().parent().find('h2').find('a').find('span').html("0");
		$("#tbl_cred_garan_hipotecaria").html("");
		$("#tbl_cred_garan_hipotecaria").parent().parent().find('h2').find('a').find('span').html("0");
		$("#tbl_cred_garan_prendaria").html("");
		$("#tbl_cred_garan_prendaria").parent().parent().find('h2').find('a').find('span').html("0");
		//cargamos el listview de las garantias
		$("#warrantReview").listview({create: function( event, ui ) {} });
		$("#warrantReview").listview("refresh");
	}
	
	if(idDiv == 'div_facturacion'){
		$('#details tr[id!="nothing"]').remove();
		$('#details tr[id="nothing"]').show();
		$("#lbl_fac_total").autoNumeric('set',0);
		$('#hd_seq').val(1);
	}
	
	$('#'+idDiv+' #div_evaluacionCaptura').collapsible("collapse");
	
	$("#txt_fidu_findCliente").val("");
	$("#txt_findCliente").val("");
}

//-------------------------------------------
// funciones genericas
//-------------------------------------------
function capturePhoto(imgHtml)
{
	//return;
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
    navigator.camera.getPicture(
            function(imageData) {
            	$(imgHtml).attr('src','');
            	$(imgHtml).attr('src','data:image/jpeg;base64,' + imageData);
            	$.mobile.loading("hide");
				$('#'+$(imgHtml).attr('id')+'_hd').val(imageData);
            },
            function(message) {
            	$.mobile.loading("hide");
            	if(message.toLowerCase() != "Camera cancelled.".toLowerCase()){
            	    navigator.notification.alert(
            	            'Error: '+message,  // message
            	            alertDismissed,         // callback
            	            'Alerta',          // title
            	            'Aceptar'        // buttonName
            	    );
            	}//fin if
            },
            { quality: 50,
              destinationType: 0,
			  saveToPhotoAlbum: true,
              correctOrientation: true}
	);
}

function obtenerCoordenadas(input1,input2)
{
	$.mobile.loading( "show", {
		  text: "Obteniendo Coordenadas",
		  textVisible: true,
		  theme: "a",
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
		});
	inputGlobal1 = input1;
	inputGlobal2 = input2;
	navigator.geolocation.getCurrentPosition(onSuccessCoordenadas, onErrorCoordenadas, {timeout: 5000, enableHighAccuracy: true});
}

//onSuccess Geolocation
function onSuccessCoordenadas(position)
{
	var lalitud=0,altitud=0;
	lalitud = position.coords.latitude;
	altitud = position.coords.longitude;
	$('#'+inputGlobal1).val(lalitud);
	$('#'+inputGlobal2).val(altitud);
	$.mobile.loading("hide");
}

// onError Callback receives a PositionError object
function onErrorCoordenadas(error) 
{
	$.mobile.loading("hide");
	switch(error.code) {
		case error.PERMISSION_DENIED:
		  alert("Acceso denegado para la obtención de coordenadas.");
		  break;
		case error.POSITION_UNAVAILABLE:
		  alert("Información de Localizacion no disponible, favor revisar que el sensor GPS esta activo.");
		  break;
		case error.TIMEOUT:
		  alert("El tiempo para obtener las coordenadas se ha agotado.");
		  break;
		case error.UNKNOWN_ERROR:
		  alert("Error desconocido.");
		  break;
		default:
		  alert('Fallo la obtencion de las coordenadas, favor revisar que el sensor GPS esta activo.');
    }
}

function cargaDataPrevia(objectColl)
{
	//app_log($(objectColl).collapsible());
}

function obtenerForm(idForm) 
{
	var form="";
	switch (eval(idForm)) {
	case 2:
		form = 'Credito';
		break;
	case 3:
		form = 'Cuentas de Ahorro';
		break;
	case 4:
		form = 'Depositos a Plazo';
		break;
	case 5:
		form = 'Fiduciaria';
		break;
	case 6:
		form = 'Hipotecaria';
		break;
	case 7:
		form = 'Prendaria';
		break;
	case 8:
		form = 'Remesas';
		break;
	}
	return form;
}

function enviarDatosAWeb(btn, cnx) 
{
	//obtenemos la ultima fecha de sincronizacion
	getUltimaSincronizacion();
	
	if(!$(btn).attr("disabled")){
		$(btn).attr("disabled","disabled");
		if(!isActiveConnection()){
			alert('Favor revisar que la coneccion a internet este activa.');
			$(btn).removeAttr("disabled");
		} 
		else {
			// por Implementar
			
		}
	}
}

function exitoSincronizacion(datos, finalizado)
{
	// por Implementar	
}

function getUltimaSincronizacion() 
{
	var db = app.webdb.db;	
	var fecha = "0";
	db.transaction(function(tx){
		tx.executeSql("SELECT MAX(ID_SINCRO), FECHA_SINCRO as ULTFECHA FROM SINCRONIZACIONES", [],function(tx, results){
			if(results.rows.length != 0){
				fecha = results.rows.item(0).ULTFECHA;
			}
			$("#lstdSincro").val(fecha);
			$('#sp_fec_sincronizacion').html(fecha);
			$('#sp_fec_sincronizacion2').html(fecha);
			$('#sp_fec_sincronizacion5').html(fecha);
		});
	});
}

function obtenerDivPorIdPagina(idPagina)
{
	var div = "n/a";
	if(idPagina == "clientes") // id = 1  
		div = "div_datosGenerales";
	else if(idPagina == "creditos") // id = 2
		div = "div_datosCreditos";
	else if(idPagina == "ahorros") // id = 3
		div = "div_ahorros";
	else if(idPagina == "depositosPlazo")// id = 4
		div = "div_depositosPlazo";
	else if(idPagina == "fiduciario")// id = 5
		div = "div_fiduciario";
	else if(idPagina == "hipotecaria")// id = 6
		div = "div_hipotecaria";
	else if(idPagina == "prendaria")// id = 7
		div = "div_prendaria";
	else if(idPagina == "remesas")// id = 8
		div = "div_remesas";
	else if(idPagina == "evalFinanciera")// id = 9
		div = "div_evalFinanciera";
	else if(idPagina == "resolucion")// id = 10
		div = "div_resolucion";
	return div;
}

function obtenerDivForm(idForm)
{
	var div = "n/a";
	if(idForm == 1) // id = 1  
		div = "div_datosGenerales";
	else if(idForm == 2) // id = 2
		div = "div_datosCreditos";
	else if(idForm == 3) // id = 3
		div = "div_ahorros";
	else if(idForm == 4)// id = 4
		div = "div_depositosPlazo";
	else if(idForm == 5)// id = 5
		div = "div_fiduciario";
	else if(idForm == 6)// id = 6
		div = "div_hipotecaria";
	else if(idForm == 7)// id = 7
		div = "div_prendaria";
	else if(idForm == 8)// id = 8
		div = "div_remesas";
	else if(idForm == 9)// id = 8
		div = "div_evalFinanciera";
	else if(idForm == 10)// id = 8
		div = "div_resolucion";
	return $('#'+div);
}

function cargarHtml(idPagina)
{
	var div = "";
	if(idPagina == 'logout')
		return;
	div = obtenerDivPorIdPagina(idPagina);
	if($('#'+div).html().trim().length > 0)
		return;
}

function guardarNotas()
{
	var db = app.webdb.db;	
	db.transaction(function(tx){
		tx.executeSql("SELECT COUNT(ID_NOTA) CANT_NOTAS FROM NOTAS WHERE USER_ID = ?", [userLoginGlobal.getUserid()],function(tx, results){
			var cantNota = results.rows.item(0).CANT_NOTAS;
			if(cantNota == 0){
				tx.executeSql("INSERT INTO NOTAS(NOTA,USER_ID) VALUES(?,?)",[$("#txt_notas").val(),userLoginGlobal.getUserid()]);
			}else{
				tx.executeSql("UPDATE NOTAS SET NOTA = ? WHERE USER_ID = ?",[$("#txt_notas").val(),userLoginGlobal.getUserid()]);
			}
		});
	},function(){},//error
	function(){//exito
		alert('NOTA guarda.');
	});
}

function cargarNotas()
{
	var db = app.webdb.db;	
	db.transaction(function(tx){
		tx.executeSql("SELECT NOTA FROM NOTAS WHERE USER_ID = ?", [userLoginGlobal.getUserid()],function(tx, results){
			if(results.rows.length != 0)
				$("#txt_notas").val(results.rows.item(0).NOTA);
			else
				$("#txt_notas").val("");
		});
	},function(){},//error
	function(){//exito
		$.mobile.changePage($('#pag_notas'));
	});
}

function irOpcion(idPagina, divLimpiar, elem)
{
	var ret;
	$('#lb_cliente').html('Clientes');
	if(idPagina == 'buscar'){
		$('#lb_cliente').html('Buscador');
		paginaActual = 2;
		idPagina = 'clientes_list';
	}
	if(idPagina == 'notas'){
		cargarNotas();
		return;
	}
	ret = obtenerDivPorIdPagina(idPagina);
	app_log('div:'+ret+'-'+idPagina);
	if(ret != "n/a"){
		if($('#'+ret).html().trim().length == 0){
			alert('El formulario que usted, trata de accesar, no esta disponible. Favor de sincronizar los formularios.');
			return;
		}
	}
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
	if(divLimpiar != undefined){
		limpiarForm(divLimpiar);
	}

	if(idPagina == 'logout') {
		$.mobile.loading("hide");
		var isLogin = confirm("\xbfDeseas cerrar tu sesion?");
		if(isLogin){
			var db = app.webdb.db;
			db.transaction(function(tx){
				tx.executeSql("UPDATE USERLOGIN SET NOMBRE = '',PASS = '',USERID = '',ROLENAME = '',COMPANYNAME = '',COMPANYID = '',COMPANYPLACE = '',LOGEADO = 'N',MENSAJE = ''",[]);
			});
			userLoginGlobal = new UserLogin();
			idPagina = 'login';
			$('#txt_user').val('');
			$('#txt_pass').val('');			
		}else
			return;
	}
	else if(idPagina == 'productos'){
		try{
			if(typeof clientGlobal == "undefined"){
				//alert(typeof(clientGlobal));
				$.mobile.loading("hide");
				alert('Para ingresar a esta opci\u00f3n, debe buscar un cliente primero.');
				return;
			}else if(clientGlobal.getId() == 0){
				$.mobile.loading("hide");
				alert('Para ingresar a esta opci\u00f3n, debe buscar un cliente primero.');
				return;			
			}			
		}catch (e) {
			app_log(e)
		}		
		$('#productos_nombreCliente').html(clientGlobal.getNombreCompleto().toUpperCase());
	}
	else if(idPagina == 'clientes_list'){
		if(paginaActual==2){
			$('#lb_cliente').html('Productos');
			$('#btn_new_client').hide();
		} else {
			$('#lb_cliente').html('Clientes');
			$('#btn_new_client').show();
		}
		cargarListaCliente(0,0,50,1);
	}
	else if(idPagina == 'clientes_list_factura' || idPagina == 'clientes_list_remesas'){
		clientGlobal = undefined;
		if(idPagina == 'clientes_list_remesas') {
			$('#lb_cliente').html('Remesas');
			cargarListaCliente(2,0,50,1);
		} else {
			$('#lb_cliente').html('Facturación');
			cargarListaCliente(1,0,50,1);
		}
		idPagina = 'clientes_list';
	}
	else if(idPagina == 'client_product_list'){
		if($(elem).data("stype")=='credito'){
			$("#pag_"+idPagina).find('#lb_cliente').html('Solicitudes Ingresadas');
		} else if($(elem).data("stype")=='ahorro'){
			$("#pag_"+idPagina).find('#lb_cliente').html('Cuentas de Ahorros Ingresadas');
		} else if($(elem).data("stype")=='deposito'){
			$("#pag_"+idPagina).find('#lb_cliente').html('Depositos a Plazos Ingresados');
		} else if($(elem).data("stype")=='remesa'){
			$("#pag_"+idPagina).find('#lb_cliente').html('Remesas Ingresadas');
		}
		
		$('#lbl_cliNomb').html(clientGlobal.getNombreCompleto().toUpperCase());
		cargarListaSolicitudesCliente($(elem).data("stype"));
	}
	else if(idPagina == 'garantias_list'){
			$('#lbl_gtia_selcliNomb').html(clientGlobal.getNombreCompleto().toUpperCase());
			cargarListaGarantiasCliente($(elem).data("gtype"), $(elem).data("idSol"));
	}
	else if(idPagina == 'clientes'){
		cargarEventosListas();
	}
	else if(idPagina == 'creditos'){
		eventosCreditos();
	}
	else if(idPagina == 'avanzado'){
		eventosAvanzados();
	}
	$('.lblUser').html(userLoginGlobal.getUserid());
	if(app.creditea.verificarLogin()){
		if(idPagina == 'garantias_list'){
			if(validarCredito()){
				$.mobile.changePage($('#pag_'+idPagina));
				$.mobile.loading("hide");
			} else {
				$.mobile.loading("hide");
			}
		} else {
			$.mobile.changePage($('#pag_'+idPagina));
			$.mobile.loading("hide");
		}
	} else {
		$.mobile.changePage($('#pag_login'));
		$.mobile.loading("hide");
	}
}

//Eventos de los objetos del Formulario de Clientes
function cargarEventosListas() 
{
	//Cargamos los datos segun sus condiciones
}


//Eventos de los objetos del Formulario de Creditos
function eventosCreditos() 
{
	cargarInfCondCredito();
	//Destinos y rubros
	$("#cb_cred_destino").on("change",function(){
		cargarRubros($(this).find('option:selected').val());return false;
	});	
	$("#cb_cred_rubro").on("change",function(){
		cargarActividadesEspecificas($(this).find('option:selected').val(), $('#cb_cred_destino').find('option:selected').val()); return false;
	});
	
	$("#cb_cred_producto").on("change", function(){
		$("#txt_cred_montoSolic").val("");
		$("#txt_cred_plazo").val("");
		$("#txt_cred_tasaInteres").val("");
		var myselect = $("#cb_cred_formaPago");
		myselect[0].selectedIndex = 0;
		myselect.selectmenu("refresh");
	});
	
	$("#txt_cred_montoSolic").on("blur", function(){
		var monto = $(this).NumBox("getRaw");
		if($("#cb_cred_producto").val() == 0){
			alert("Debe Seleccionar un producto");
			$("#cb_cred_producto").focus();
			return false;
		}
		
		if(monto != 0){
			validarProducto(eval($("#cb_cred_producto").val()), monto, $("#txt_cred_tasaInteres").val());
		}
	});
	$("#txt_cred_tasaInteres").on("blur",function(){
		if($(this).val().length != 0){
			validarProducto(eval($("#cb_cred_producto").val()), $("#txt_cred_montoSolic").NumBox("getRaw"), $(this).val());
		}
	});
	$("#txt_cred_plazo").on("blur",function(){
		if($(this).val().length != 0){
			validarProducto(eval($("#cb_cred_producto").val()), $("#txt_cred_montoSolic").NumBox("getRaw"), $("#txt_cred_tasaInteres").val(), $(this).val());
		}
	});	
	$("#cb_cred_formaPago").on("change",function(){
		if($(this).val().length != 0){
			validarProducto(eval($("#cb_cred_producto").val()), $("#txt_cred_montoSolic").NumBox("getRaw"), $("#txt_cred_tasaInteres").val(), $("#txt_cred_plazo").val(), $(this).find("option:selected").val());
		}
	});
	
	$("#cb_cred_metodologia").on("change",function(){
		if($(this).find('option:selected').text().toUpperCase() == "SOLIDARIO") {
			$("#td_cred_grupo").fadeIn("slow");
		} else {
			$("#td_cred_grupo").fadeOut("slow");
			limpiarForm("td_cred_grupo");
		}	
	});

	$("#btnCotiza").on("click", function () { 
		var monto = $("#txt_cred_montoSolic").val();
		var tasa = $("#txt_cred_tasaInteres").val();
		var cuotasCapital = $("#txt_cred_nCuotas").val();
		var cuotasInteres = $("#txt_cred_nCuotasInteres").val();
		  if(monto == 0){
			alert("debe ingresar un monto");
			$("#txt_cred_montoSolic").focus();
			return false;
		  }
		  if(tasa == 0){
			alert("debe ingresar una tasa");
			$("#txt_cred_tasaInteres").focus();
			return false;
		  }
		  if(cuotasCapital == 0){
			alert("debe ingresar el numero de cuotas capital");
			$("#txt_cred_nCuotas").focus();
			return false;
		  }
		  if(cuotasInteres == 0){
			alert("debe ingresar el numero de cuotas interes");
			$("#txt_cred_nCuotasInteres").focus();
			return false;
		  }
		  $("#frmCotiza").html('<div style="text-align:center;">Cargando Información...</div>');
		  $("#frmCotiza").load(apiBaseUrlConsulto+"/product/cotizador?m="+monto+"&t="+tasa+"&cc="+cuotasCapital+"&ci="+cuotasInteres);
	});

	//para las garantias
	$(".showFidu").on("click", function(){
		$("#tbl_cred_garan_fiduciarios").toggle("slow");
	});
	$(".showHipo").on("click", function(){
		$("#tbl_cred_garan_hipotecaria").toggle("slow");
	});
	$(".showPrend").on("click", function(){
		$("#tbl_cred_garan_prendaria").toggle("slow");
	});
}

function cargarInfCondCredito() 
{
	
}


function eventosAvanzados() 
{
	var systemTables = ['__WebKitDatabaseInfoTable__','sqlite_sequence'];
	var db = app.webdb.db;
	db.transaction(function(tx){
				tx.executeSql("SELECT * FROM sqlite_master WHERE type=:type",["table"],
					function(tx,results){
						var len = results.rows.length;
						if(len != 0){
							$('#detectTables').empty();
							for(var i=0;i<len;i++){				
								var row = results.rows.item(i);
								if($.inArray(row['name'], systemTables) == -1){
									html = '<a href="#" onclick="llenarTextarea(\''+row['name']+'\');">'+row['name']+'</a>, ';
									$('#detectTables').append(html);
								}
							}//fin for
						} 
					}//fin tx,results
				);
			},app.webdb.onError);
}

function llenarTextarea(tableName)
{
	var field = $("#query").find('textarea');
	field.val("SELECT * FROM "+tableName);
	$("#btnExecQuery").click();
}

// Funciones para Dempartamento/Municipio/Aldea
function cargarDeps()
{
	var db = app.webdb.db;
	var query = "SELECT ID_DEP,NOMBRE FROM DEPARTAMENTO";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[],function(tx,results){
			var len = results.rows.length;
			$('#cb_departamento').html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				html = '<option value="'+row['ID_DEP']+'">'+row['ID_DEP']+' - '+row['NOMBRE']+'</option>';
				$('#cb_departamento').append(html);
			}//fin for
 			$('#cb_departamento').selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarMuni(val, div_muni, sel)
{
	var sel = sel || 0;
	var db = app.webdb.db;
	var query = "SELECT CODE, NOMBRE FROM MUNICIPIO WHERE ID_DEP = ? ORDER BY CODE";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[val],function(tx,results){
			var len = results.rows.length;
			$(div_muni).html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				if(sel == row['CODE']){
					html = '<option value="'+row['CODE']+'" selected="selected">'+row['CODE']+' - '+row['NOMBRE']+'</option>';
				} else {
					html = '<option value="'+row['CODE']+'">'+row['CODE']+' - '+row['NOMBRE']+'</option>';
				}
				$(div_muni).append(html);
			}//fin for
			$(div_muni).selectmenu('refresh');
		});
	}, app.webdb.onError);
}

// FIN Funciones para Dempartamento/Municipio/Aldea

function cargarListaCliente(factura, inicio, por_pagina, limpiar)
{
	inicio = inicio || 0;
	por_pagina = por_pagina || 250;
	factura = factura || 0;
	limpiar = limpiar || 0;
	var db = app.webdb.db;
	var query = "SELECT ID_CAP_CUSTOMER, FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, NATIONALITY, IDENTITY FROM CAP_CUSTOMER ORDER BY FIRSTNAME, LASTNAME1 LIMIT "+por_pagina+" OFFSET "+inicio;
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[],function(tx,results){
			var len = results.rows.length;
			if(limpiar != 0) {
				$('#ul_detalleCliente_list').html("");
			}
			for(var i=0;i<len;i++){
				var row = results.rows.item(i);
				if(limpiar != 0) {
					curr = i + 1;
				} else {
					curr =  eval(inicio) + i + 1;
				}
				html = '<tr><td><img style="width:16px;height:16px;" src="images/ico-perfil.png" /></td><td>'+curr+'</td>';
				html += '<td style="width: 60px">'+row['ID_CAP_CUSTOMER']+'</td><td>'+row['FIRSTNAME'].toUpperCase()+' '+row['MIDNAME'].toUpperCase()+'</td><td>'+row['LASTNAME1'].toUpperCase()+' '+row['LASTNAME2'].toUpperCase()+'</td><td>'+row['IDENTITY']+'</td>';
				html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="limpiarForm(\'div_datosGenerales\'); llenarClienteSesion('+row['ID_CAP_CUSTOMER']+');return false;"/></td></tr>';
				$('#ul_detalleCliente_list').append(html);
			}//fin for
			$("#hdnpag").val(eval(inicio)+por_pagina);
			
			if(factura == 1){
				$("#fctnc").find('a').attr("onclick","irOpcion('facturacion');return false;");
				$("#fctnc").find('a').html("Facturar No Cliente");
				$("#fctnc").show();
			} else if(factura == 2) {
				$("#fctnc").find('a').attr("onclick","irOpcion('remesas');return false;");
				$("#fctnc").find('a').html("Remesa No Cliente");
				$("#fctnc").show();
			} else {
				$("#fctnc").hide();
			}
			
			if(len < por_pagina) {
				$("#btnpagcli").closest('.ui-btn').hide();
			} else {
				$("#btnpagcli").closest('.ui-btn').show();
			}
		});
	}, app.webdb.onError);
}

function cargarListaSolicitudesCliente(tipo)
{
	var idForm =0;
	if(tipo=='credito'){
		idForm=2;
	} else if(tipo=='ahorro'){
		idForm=3;
	} else if(tipo=='deposito'){
		idForm=4;
	} else if(tipo=='remesa'){
		idForm=8;
	}
	var db = app.webdb.db;
	var query = "SELECT ID, FORM_RESPONSE, DATE_CREATED FROM STORAGE WHERE FORM=? AND CUSTOMER_REQUESTS=? ORDER BY ID DESC";
	var html = "";
	
	db.transaction(function(tx){
		tx.executeSql(query,[idForm, clientGlobal.getId()],function(tx,results){
			var len = results.rows.length;
			app_log('cliente tiene registrado ' + len + ' solicitudes');
			$('#ul_detalleProducto_list').html("");
			if(tipo=='credito'){
				//Mostramos el encabezado
				$("#head-credito").show();
				$("#head-ahorro").hide();
				$("#head-deposito").hide();
				$("#head-remesa").hide();
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					html  = '<tr>';
					html += '<td>'+row['ID']+'</td>';
					html += '<td>'+$("#cb_cred_producto").find('option[value='+info.cb_cred_producto+']').text()+'</td>';
					html += '<td>L. '+info.txt_cred_montoSolic+'</td>';
					html += '<td>'+info.txt_cred_plazo+' Meses</td>';
					html += '<td>'+$("#cb_cred_destino").find('option[value='+info.cb_cred_destino+']').text()+'</td>';
					html += '<td>'+row['DATE_CREATED']+'</td>';
					html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 2);return false;"/></td></tr>';
					$('#ul_detalleProducto_list').append(html);
				}//fin for
			} 
			else if(tipo=='ahorro'){
				//Mostramos el encabezado
				$("#head-credito").hide();
				$("#head-ahorro").show();
				$("#head-deposito").hide();
				$("#head-remesa").hide();
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					html  = '<tr>';
					html += '<td>'+row['ID']+'</td>';
					html += '<td>'+$("#cb_aho_producto").find('option[value='+info.cb_aho_producto+']').text()+'</td>';
					html += '<td>L. '+info.txt_aho_montoApertura+'</td>';
					html += '<td>'+row['DATE_CREATED']+'</td>';
					html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 3);return false;"/></td></tr>';
					$('#ul_detalleProducto_list').append(html);
				}//fin for
			} 
			else if(tipo=='deposito'){
				//Mostramos el encabezado
				$("#head-credito").hide();
				$("#head-ahorro").hide();
				$("#head-deposito").show();
				$("#head-remesa").hide();
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					html  = '<tr>';
					html += '<td>'+row['ID']+'</td>';
					html += '<td>'+$("#cb_desPlazos_producto").find('option[value='+info.cb_desPlazos_producto+']').text()+'</td>';
					html += '<td>L. '+info.txt_desPlazos_monto+'</td>';
					html += '<td>'+info.txt_desPlazos_plazo+' Meses</td>';
					html += '<td>'+row['DATE_CREATED']+'</td>';
					html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 4);return false;"/></td></tr>';
					$('#ul_detalleProducto_list').append(html);
				}//fin for
			} 
			else if(tipo=='remesa'){
				//Mostramos el encabezado
				$("#head-credito").hide();
				$("#head-ahorro").hide();
				$("#head-deposito").hide();
				$("#head-remesa").show();
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					html  = '<tr>';
					html += '<td>'+row['ID']+'</td>';
					html += '<td>'+info.cb_rem_transaccion+' - '+$("#cb_rem_transaccion").find('option[value='+info.cb_rem_transaccion+']').text()+'</td>';
					html += '<td>'+info.txt_rem_mtcn+'</td>';
					html += '<td>';
					html += info.cb_rem_transaccion==2?info.txt_rem_paisEnvio:info.txt_rem_paisProce;
					html += '</td>';
					html += '<td>'+row['DATE_CREATED']+'</td>';
					html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 8);return false;"/></td></tr>';
					$('#ul_detalleProducto_list').append(html);
				}//fin for
			}
		});
	}, app.webdb.onError);
}

function cargarListaGarantiasCliente(garantia,inicio, por_pagina, limpiar)
{
	inicio = inicio || 0;
	por_pagina = por_pagina || 50;
	limpiar = limpiar || 0;
	var idForm=0;
	if(garantia=='fiduciario'){
		idForm=1;
	} else if(garantia=='hipotecaria'){
		idForm=6;
	} else if(garantia=='prendaria'){
		idForm=7;
	}
	var db = app.webdb.db;
	if(garantia=='fiduciario'){
		var query = "SELECT s.ID, ID_CAP_CUSTOMER, FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, NATIONALITY, IDENTITY, PATRIMONY FROM CAP_CUSTOMER c INNER JOIN STORAGE s ON c.ID_CAP_CUSTOMER=S.CUSTOMER_REQUESTS WHERE FORM=? LIMIT "+por_pagina+" OFFSET "+inicio;
		var params = [idForm];
	} else {
		var query = "SELECT ID, FORM_RESPONSE, CUSTOMER_REQUESTS FROM STORAGE WHERE FORM=? AND CUSTOMER_REQUESTS=?";
		var params = [idForm, clientGlobal.getId()];
	}
	var html = "";
	var prendas = ['','','','Vehicular','Maquinaria/Bienes','','Ahorros'];
	var inmuebles = ['','Solar','Solar y Casa','Terreno','Terreno y Casa'];
	if(idForm == 1) {
		$("#newGarantia").hide();
	} else {
		$("#newGarantia").show();
		$("#newGarantia").on("click", function(e){
			e.preventDefault();
			if(garantia=='prendaria'){
				$("#cb_pren_tipoGaranPrendaria").selectmenu('enable');
			}
			irOpcion(garantia);
		});
	}
	db.transaction(function(tx){
		tx.executeSql(query,params,function(tx,results){
			var len = results.rows.length;
			app_log('hay ' + len + ' garantias');
			$('#ul_detalleElemento_list').html("");
			if(garantia=='fiduciario'){
				//Mostramos el encabezado
				$("#head-fiduciario").show();
				$("#head-hipotecario").hide();
				$("#head-prendario_vehiculo").hide();
				$("#head-prendario_maquinaria").hide();
				$("#head-prendario_ahorro").hide();
				fidu_identidades = [];
				//ingresamos los valores
				for(var i=0;i<len;i++){
					if(limpiar != 0) {
						curr = i + 1;
					} else {
						curr =  eval(inicio) + i + 1;
					}
					var row = results.rows.item(i);
					if(row['CUSTOMER_REQUESTS'] == clientGlobal.getId()){
						continue;
					}
					//var info = $.parseJSON(row['FORM_RESPONSE']);
					//if($.inArray(info.txt_fidu_identidad,fidu_identidades) == -1){
						html  = '<tr>';
						html += '<td>'+row['ID']+'</td>';
						html += '<td>'+row['IDENTITY']+'</td>';
						html += '<td>'+row['FIRSTNAME'].toUpperCase()+' ';
						html += row['MIDNAME']==null?'</td>':row['MIDNAME'].toUpperCase()+'</td>';
						html += '<td>'+row['LASTNAME1'].toUpperCase()+' ';
						html += row['LASTNAME2']==null?'</td>':row['LASTNAME2'].toUpperCase() + '</td>';
						html += '<td>L. '+formatMoney(row['PATRIMONY'], 2)+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 1);return false;"/></td></tr>';
						
						$('#ul_detalleElemento_list').append(html);
					//	fidu_identidades.push(info.txt_fidu_identidad);
					//}
				}//fin for
				$("#hdnpag").val(eval(inicio)+por_pagina);
				
				if(len < por_pagina) {
					$("#btnpagcli").closest('.ui-btn').hide();
				} else {
					$("#btnpagcli").closest('.ui-btn').show();
				}
				
			} 
			else if(garantia=='hipotecaria'){
				//Mostramos el encabezado
				$("#head-fiduciario").hide();
				$("#head-hipotecario").show();
				$("#head-prendario_vehiculo").hide();
				$("#head-prendario_maquinaria").hide();
				$("#head-prendario_ahorro").hide();
				fidu_hipotecas = [];
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					if($.inArray(info.cb_hipo_tipoInmueble+'-'+info.txt_hipo_numero+'-'+info.txt_hipo_tomo,fidu_hipotecas) == -1){
						html  = '<tr>';
						html += '<td>'+row['ID']+'</td>';
						html += '<td>'+inmuebles[info.cb_hipo_tipoInmueble]+'</td>';
						html += '<td>'+info.txt_hipo_numero+'</td>';
						html += '<td>'+info.txt_hipo_tomo+'</td>';
						html += '<td>L. '+info.txt_cap_total_avaluo+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 6);return false;"/></td></tr>';
						$('#ul_detalleElemento_list').append(html);
						fidu_hipotecas.push(info.cb_hipo_tipoInmueble+'-'+info.txt_hipo_numero+'-'+info.txt_hipo_tomo);
					}
				}//fin for
			} 
			else if(garantia=='prendaria'){
				//Mostramos el encabezado
				$("#head-fiduciario").hide();
				$("#head-hipotecario").hide();
				$("#head-prendario_vehiculo").hide();
				$("#head-prendario_maquinaria").hide();
				$("#head-prendario_ahorro").hide();
				$('#ul_detalleVehiculos_list').html("");
				$('#ul_detalleMaquinaria_list').html("");
				$('#ul_detalleAhorro_list').html("");
				//ingresamos los valores
				fidu_prendarias = [];
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					if(info.cb_pren_tipoGaranPrendaria==3){
						$("#head-prendario_vehiculo").show();
						if($.inArray(info.txt_pren_vehMarca+'-'+info.txt_pren_vehModelo+'-'+info.txt_pren_vehPlaca,fidu_prendarias) == -1){
							html  = '<tr>';
							html += '<td>'+row['ID']+'</td>';
							html += '<td>'+info.txt_pren_vehMarca.toUpperCase()+'</td>';
							html += '<td>'+info.txt_pren_vehModelo.toUpperCase()+'</td>';
							html += '<td>'+info.txt_pren_vehPlaca.toUpperCase()+'</td>';
							html += '<td>L. '+info.txt_pren_vehValorAvaluo+'</td>';
							html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 7);return false;"/></td></tr>';	
							$('#ul_detalleVehiculos_list').append(html);
							fidu_prendarias.push(info.txt_pren_vehMarca+'-'+info.txt_pren_vehModelo+'-'+info.txt_pren_vehPlaca);
						}
					}
					if(info.cb_pren_tipoGaranPrendaria==4){
						$("#head-prendario_maquinaria").show();
						if($.inArray(info.cb_pren_maqTipoBien+'-'+info.txt_pren_maqMontoCobertura,fidu_prendarias) == -1){
							html  = '<tr>';
							html += '<td>'+row['ID']+'</td>';
							html += '<td>'+$("#cb_pren_maqTipoBien").find('option[value='+info.cb_pren_maqTipoBien+']').text()+'</td>';
							html += '<td>L. '+info.txt_pren_maqMontoCobertura+'</td>';
							html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 7);return false;"/></td></tr>';	
							$('#ul_detalleMaquinaria_list').append(html);
							fidu_prendarias.push(info.cb_pren_maqTipoBien+'-'+info.txt_pren_maqMontoCobertura);
						}
					}
					if(info.cb_pren_tipoGaranPrendaria==6) {
						$("#head-prendario_ahorro").show();
						if($.inArray(info.txt_pren_AhoNombrePropietario+'-'+info.txt_pren_AhoNumDocumento,fidu_prendarias) == -1){
							html  = '<tr>';
							html += '<td>'+row['ID']+'</td>';
							html += '<td>'+$("#cb_pren_AhoClaseGarantia").find('option[value='+info.cb_pren_AhoClaseGarantia+']').text()+'</td>';
							html += '<td>'+(info.txt_pren_AhoNombrePropietario==null?' ':info.txt_pren_AhoNombrePropietario.toUpperCase())+'</td>';
							html += '<td>'+info.txt_pren_AhoNumDocumento+'</td>';
							html += '<td>L. '+info.txt_pren_AhoSaldoCuenta+'</td>';
							html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 7);return false;"/></td></tr>';	
							$('#ul_detalleAhorro_list').append(html);
							fidu_prendarias.push(info.txt_pren_AhoNombrePropietario+'-'+info.txt_pren_AhoNumDocumento);
						}
					}
				}//fin for
			}
		});
	}, app.webdb.onError);
}

function llenarClienteSesion(idCliente)
{
	app.creditea.verificarLogin(1);
	var db = app.webdb.db;
	var html = "";
	db.transaction(function(tx){
		tx.executeSql("SELECT ID,FORM_RESPONSE, IDENTITY FROM STORAGE s INNER JOIN CAP_CUSTOMER c ON c.ID_CAP_CUSTOMER=S.CUSTOMER_REQUESTS WHERE CUSTOMER_REQUESTS = ? and form = 1",[idCliente],function(tx,results){
			var len = results.rows.length;
			for(var i=0;i<len;i++){
				//limpiamos imagenes
				$.each($('#div_datosGenerales img[name^="img_"]'), function(index, input){
					$(input).attr("src","");
				});
				$.each($('#div_datosGenerales input[name^="img_"]'), function(index, input){
					$(input).val("");
				});
				var row = results.rows.item(i);
				var jsonR = JSON.parse(row['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
				$('#orgId').val(idCliente);
				$('#orgIdentity').val(row['IDENTITY']);
				prevsel = 0;
				prevciiu = 0;
				prevciiu2 = 0;
				prevciiu3 = 0;
				$.each(jsonR,function(input, value){
					if(input != 'idFormulario'){
						if(input.indexOf("txt_") != -1) {
							$('#'+input).val(value);
						} else if(input.indexOf("cb_") != -1) {							
							//app_log('#'+input+' option[value='+value+']');
							 if(input == "cb_municipio" ) {
								cargarMuni($('#cb_departamento').find('option:selected').val(), "#"+input, value);
								prevsel = value;
							} else if(input == "cb_aldea" ) {
							    cargarAldea(prevsel, $('#cb_departamento').find('option:selected').val(), "#"+input, value);
							    prevesel = 0;
							} else if(input == "cb_ciiu_sector"){
								$('#'+input+' option').removeAttr('selected').filter('[value='+value+']').attr('selected', true);
								$('#'+input).selectmenu('refresh', true);
								prevciiu = value;
							} else if(input == "cb_ciiu_subsector"){
								cargarSubsectores(prevciiu, value);
								prevciiu2 = value;
							} else if(input == "cb_ciiu_rama"){
								cargarRamas(prevciiu, prevciiu2, value);
								prevciiu3 = value;
							}  else if(input == "cb_ciiu_clase"){
								cargarClases(prevciiu, prevciiu2, prevciiu3, value);
								prevciiu = 0;
								prevciiu2 = 0;
								prevciiu3 = 0;
							} else {
								$('#'+input+' option').removeAttr('selected').filter('[value='+value+']').attr('selected', true);
								$('#'+input).selectmenu('refresh', true);
							}
						} else if(input.indexOf("img_") != -1) {
							if(value.length > 0){
								$('#'+input.substring(0,input.length-3)).attr('src','data:image/jpeg;base64,' + value);
								$('#'+input).val(value);
							}						
						} else if(input.indexOf("hd_") != -1){
							$('#'+input).val(value);
						}
					}//fin input != 'idFormulario'
				   // app_log('My array has at input ' + input + ', this value: ' + value); 
				});
				//PONER LAS FOTOS
				tx.executeSql("SELECT ID_IMG,FOTO FROM FOTOS WHERE ID_STORAGE = ?",[row['ID']],function(tx,results){
					var len = results.rows.length;
					for(var i=0;i<len;i++){
						var row = results.rows.item(i);
						var value = row['FOTO'];
						if(value.length > 0){
							$('#'+row['ID_IMG']).attr('src','data:image/jpeg;base64,' + value);
							$('#'+row['ID_IMG']+'_hd').val(value);
						} else if($('#'+row['ID_IMG']+'_hd').val() != ""){
							$('#'+row['ID_IMG']).attr('src','data:image/jpeg;base64,' + $('#'+row['ID_IMG']+'_hd').val());
						}
					}//fin for					
				});
			}//fin for
			clientGlobal = new Cliente();
			clientGlobal.cargarDatos(idCliente);//toma los valores de los input's
			app_log(clientGlobal.getId());
			//-----------llenar los formularios
			$('#txt_aho_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_aho_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_aho_codCliente').val(clientGlobal.getId());
			
			$('#txt_desPlazos_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_desPlazos_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_desPlazos_codCliente').val(clientGlobal.getId());
			
			$('#txt_cred_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_cred_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_cred_codCliente').val(clientGlobal.getId());
			
			$('#txt_solf_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_solf_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_solf_codCliente').val(clientGlobal.getId());
			
			$('#txt_hipo_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_hipo_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_hipo_codCliente').val(clientGlobal.getId());
			
			$('#txt_pren_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_pren_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_pren_codCliente').val(clientGlobal.getId());
			
			$('#txt_rem_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_rem_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_rem_codCliente').val(clientGlobal.getId());
			
			$('#txt_evalfin_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_evalfin_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_evalfin_codCliente').val(clientGlobal.getId());
			
			$('#txt_reso_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_reso_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_reso_codCliente').val(clientGlobal.getId());
			
			$('#txt_fac_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_fac_identidad').val(clientGlobal.getNoIdentidad());
			$('#txt_fac_usuario').val(userLoginGlobal.getNombre());
			$('#txt_fac_fecha').val(formatDate(new Date()));
			
			//-------------
			//limpiamos filtros de busqueda.
			$( "#txt_findCliente" ).val("");
			$( "#txt_fidu_findCliente" ).val("");
			
			//--------enviar mensaje de exito-------
			$('#div_contentMessage').html('El perfil del cliente <h2>'+clientGlobal.getNombreCompleto()+'</h2><br/>ha sido cargado exitosamente.');
			$('#div_subMessage').hide();
			$('#div_sel_producto').show();
			$('#btn_sel_producto').show();
			//una vez cargado los valores, se deben de llevar al formulario requerido
			switch (paginaActual) {
			case 1:
				irOpcion('clientes');	
				break;
			case 2:
				db.transaction(function(tx){
					tx.executeSql("SELECT COUNT(FORM) CREDITOS,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 3) CUENTA_AHORRO,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 4) DEPOSITO_PLAZO,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 8) REMESAS FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 2",[idCliente,idCliente,idCliente,idCliente],function(tx,results){
						var cant_creditos = results.rows.item(0).CREDITOS;
						var cant_ahorro = results.rows.item(0).CUENTA_AHORRO;
						var cant_depPlazo = results.rows.item(0).DEPOSITO_PLAZO;
						var cant_remesas = results.rows.item(0).REMESAS;
						$('#sol_credit_ing').html(cant_creditos);
						$('#sol_cue_ahorro').html(cant_ahorro);
						$('#sol_depos').html(cant_depPlazo);
						$('#sol_remesas').html(cant_remesas);
						
						if(cant_creditos > 0) {
							if(!$('#prodLstCrd').length){
								$('#sol_credit_ing').parent().parent().wrap('<a id="prodLstCrd" data-stype="credito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
							}
						}
						if(cant_ahorro > 0) {
							if(!$('#prodLstAho').length){
								$('#sol_cue_ahorro').parent().parent().wrap('<a id="prodLstAho" data-stype="ahorro" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
							}
						}
						if(cant_depPlazo > 0) {
							if(!$('#prodLstDep').length){
								$('#sol_depos').parent().parent().wrap('<a id="prodLstDep" data-stype="deposito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
							}
						}
						if(cant_remesas > 0) {
							if(!$('#prodLstRem').length){
								$('#sol_remesas').parent().parent().wrap('<a id="prodLstRem" data-stype="remesa" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
							}
						}
					});
				},function(){},//error
				function(){//exito
					irOpcion('productos');	
				});
				break;
			case 3:
				irOpcion('facturacion');
				break;
			case 4:
				irOpcion('remesas');
				break;
			}//fin switch
		});
	}, app.webdb.onError);
}

function llenarSolicitud(idSolicitud, idForm, nuevo, sel) 
{
	app.creditea.verificarLogin(1);
	var db = app.webdb.db;
	var html = "";
	db.transaction(function(tx){
		tx.executeSql("SELECT ID, FORM, FORM_RESPONSE FROM STORAGE WHERE ID = ?",[idSolicitud],function(tx,results){
			var len = results.rows.length;
			var idformulario = results.rows.item(0);
			for(var i=0;i<len;i++){
				var row = results.rows.item(i);
				var jsonR = JSON.parse(row['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
				prevsel = 0;
				prevciiu = 0;
				prevciiu2 = 0;
				prevciiu3 = 0;
				prevcred = 0;
				$.each(jsonR,function(input, value){
					if(input != 'idFormulario'){
						if(idForm == 1) {
							input = input.replace("txt_","txt_fidu_");
							input = input.replace("cb_","cb_fidu_");
							input = input.replace("hd_","hd_fidu_");
							input = input.replace("img_","img_fidu_");
						}
						if(input.indexOf("txt_") != -1){
							if($('#'+input).hasClass('format_number')) {
								if(value != null){
									$('#'+input).val(value.replace(",",""));
								}
							} else {
								$('#'+input).val(value);
							}
						} else if(input.indexOf("chk_") != -1) {
							if(value == "1"){
								$('#'+input).attr("checked",true);
								$('#'+input).checkboxradio('refresh');
							}
						} else if(input.indexOf("cb_") != -1){
							//app_log('#'+input+' option[value='+value+']');
							if(input == "cb_fidu_municipio" || input == "cb_hipo_municipio"){
								divId = (input == "cb_fidu_municipio")?"#cb_fidu_departamento":"#cb_hipo_departamento";
								cargarMuni($(divId).find('option:selected').val(), "#"+input, value);
								prevsel = value;
							} else if(input == "cb_fidu_aldea" || input == "cb_hipo_aldea"){
								parId = (input == "cb_fidu_aldea")?"#cb_fidu_departamento":"#cb_hipo_departamento";
								divId = (input == "cb_fidu_aldea")?"#cb_fidu_municipio":"#cb_hipo_municipio";
								cargarAldea(prevsel, $(parId).find('option:selected').val(), "#"+input, value);
								prevsel = 0;
							} else if(input == "cb_ciiu_sector" || input == "cb_fidu_ciiu_sector"){
								$('#'+input+' option').removeAttr('selected').filter('[value='+value+']').attr('selected', true);
								$('#'+input).selectmenu('refresh', true);
								prevciiu = value;
							} else if(input == "cb_ciiu_subsector" || input == "cb_fidu_ciiu_subsector"){
								cargarSubsectores(prevciiu, value, (input == "cb_fidu_ciiu_subsector"));
								prevciiu2 = value;
							} else if(input == "cb_ciiu_rama" || input == "cb_fidu_ciiu_rama"){
								cargarRamas(prevciiu, prevciiu2, value, (input == "cb_fidu_ciiu_rama"));
								prevciiu3 = value;
							}  else if(input == "cb_ciiu_clase" || input == "cb_fidu_ciiu_clase"){
								cargarClases(prevciiu, prevciiu2, prevciiu3, value, (input == "cb_fidu_ciiu_clase"));
								prevciiu = 0;
								prevciiu2 = 0;
								prevciiu3 = 0;
							} else if(input == "cb_cred_rubro"){
								cargarRubros($("#cb_cred_destino").find('option:selected').val(), value);
								prevcred = value;
							}  else if(input == "cb_cred_actEspecifica"){
								cargarActividadesEspecificas(prevcred, $("#cb_cred_destino").find('option:selected').val(), value);
								prevcred = 0;
							} else {
								$('#'+input+' option').removeAttr('selected').filter('[value='+value+']').attr('selected', true);
								$('#'+input).selectmenu('refresh');
							}
						} else if(input.indexOf("img_") != -1) {
							if(value.length > 0){
								$('#'+input.substring(0,input.length-3)).attr('src','data:image/jpeg;base64,' + value);
								$('#'+input).val(value);
							}else{
								$('#'+input).attr('src','');
							}							
						} else if(input.indexOf("hd_") != -1){
							$('#'+input).val(value);
						}
						
					}//fin input != 'idFormulario'
				   // app_log('My array has at input ' + input + ', this value: ' + value); 
				});
				//PONER LAS FOTOS
				tx.executeSql("SELECT ID_IMG,FOTO FROM FOTOS WHERE ID_STORAGE = ?",[row['ID']],function(tx,results){
					var len = results.rows.length;
					for(var i=0;i<len;i++){
						var row = results.rows.item(i);
						var value = row['FOTO'];
						if(value.length > 0){
							$('#'+row['ID_IMG']).attr('src','data:image/jpeg;base64,' + value);
							$('#'+row['ID_IMG']+'_hd').val(value);
						} else if($('#'+row['ID_IMG']+'_hd').val() != ""){
							$('#'+row['ID_IMG']).attr('src','data:image/jpeg;base64,' + $('#'+row['ID_IMG']+'_hd').val());
						}
					}//fin for					
				});
			}//fin for
			
			if(typeof nuevo == 'undefined'){
				if(idForm==1)
				{
					if ($('#editForm5').length){
						$('#editForm5').val(idformulario['ID']);
					} else {
						var ubi = obtenerDivForm(5);
						$('<input type="hidden" name="editForm5" id="editForm5" value="'+idformulario['ID']+'" />').insertBefore(ubi);
					}

				} else {
					if ($('#editForm'+idformulario['FORM']).length){
						$('#editForm'+idformulario['FORM']).val(idformulario['ID']);
					} else {
						var ubi = obtenerDivForm(idformulario['FORM']);
						$('<input type="hidden" name="editForm'+idformulario['FORM']+'" id="editForm'+idformulario['FORM']+'" value="'+idformulario['ID']+'" />').insertBefore(ubi);
					}
				}
			}
			//una vez cargado los valores, se deben de llevar al formulario requerido
			switch (idformulario['FORM']) {
			case 2:				
				$("#credId_gtia_fidu").val(idformulario['ID']);
				$("#credId_gtia_hipo").val(idformulario['ID']);
				$("#credId_gtia_pren").val(idformulario['ID']);
				$("#credId_eval_fin").val(idformulario['ID']);
				$("#credId_resolucion").val(idformulario['ID']);
				if($('#editForm'+idformulario['FORM']).length && $('#editForm'+idformulario['FORM']).val() != 0) {
					mostrarGarantias(idformulario['ID']);
				}
				irOpcion('creditos');	
				break;
			case 3:
				irOpcion('ahorros');	
				break;
			case 4:
				irOpcion('depositosPlazo');
				break;
			case 1:
				inhabilitarSelectFiduciario();
				irOpcion('fiduciario');
				break;
			case 6:
				irOpcion('hipotecaria');
				break;
			case 7:
				if(typeof nuevo == 'undefined'){
					$("#cb_pren_tipoGaranPrendaria").selectmenu('disable');
				} else {
					if(typeof sel == 'undefined'){
						$("#cb_pren_tipoGaranPrendaria").selectmenu('disable');
					} else {
						$("#cb_pren_tipoGaranPrendaria").selectmenu('enable');
					}
				}
				irOpcion('prendaria');
				break;
			case 8:
				irOpcion('remesas');
				break;
			case 9:
				//Cargamos la informacion inicial
				cargarInformacion();
				
				//hacemos los calculos necesarios
				calculosBalance();
				calculosAnalisisCuota();
				calculoIndicadores();
				calculoCrecimiento();
				break;
			}//fin switch
		});
	}, app.webdb.onError);
}

function mostrarGarantias(idSolicitud) 
{
	var db = app.webdb.db;
	var html = "";
	var idCliente = clientGlobal.getId();
	db.transaction(function(tx){
		tx.executeSql("SELECT s.ID, FORM, FORM_RESPONSE FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE g.ID_SOL = ? AND g.ELIMINADA=0",[idSolicitud],function(tx,results){
			//limpiamos los espacios para las garantias
			$("#tbl_cred_garan_fiduciarios").html("");
			$("#tbl_cred_garan_hipotecaria").html("");
			$("#tbl_cred_garan_prendaria").html("");
			
			var len = results.rows.length;
			if(len != 0) {				
				var idformulario = results.rows.item(0);
				var gtia1 = '', gtia2 = "", gtia3 = "";
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var response = JSON.parse(row['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
					var prendas = ['','','','Vehicular','Maquinaria/Bienes','','Ahorros'];
					var inmuebles = ['','Solar','Solar y Casa','Terreno','Terreno y Casa'];
					if(response.idFormulario == 5 || response.idFormulario == 1) {
						gtia1 += '<li><a href="#" onclick="llenarSolicitud('+row['ID']+',1);" class="itemGar">['+response.txt_noIdentidad+'] '+ response.txt_primerNombre;
						gtia1 += response.txt_segundoNombre==null?' ':' '+response.txt_segundoNombre;
						gtia1 += ' '+response.txt_primerApellido+' ';
						gtia1 += response.txt_segundoApellido==null?'</a></li>':response.txt_segundoApellido+'</a><a class="ui-li-link-alt-left" href="#" onclick="quitarGarantia('+row['ID']+','+idSolicitud+');">Eliminar</a></li>';
					} else if(response.idFormulario  == 6) {
						gtia2 += '<li><a href="#" onclick="llenarSolicitud('+row['ID']+');" class="itemGar" >['+inmuebles[response.cb_hipo_tipoInmueble]+'] Numero: '+response.txt_hipo_numero+' Tomo: '+response.txt_hipo_tomo+' - '+response.txt_hipo_propietarioInmueble+' '+response.txt_hipo_primerApellido+' '+response.txt_hipo_segundoApellido+'</a><a class="ui-li-link-alt-left" href="#" onclick="quitarGarantia('+row['ID']+','+idSolicitud+');">Eliminar</a></li>';
					} else if(response.idFormulario  == 7) {
						nombre = response.cb_pren_tipoGaranPrendaria=="6"?response.txt_pren_AhoNombrePropietario:response.txt_pren_nombre;
						gtia3 += '<li><a href="#" onclick="llenarSolicitud('+row['ID']+');" class="itemGar">Prenda '+ prendas[response.cb_pren_tipoGaranPrendaria]+' - '+nombre+'</a><a class="ui-li-link-alt-left" href="#del" onclick="quitarGarantia('+row['ID']+','+idSolicitud+');">Eliminar</a></li>';
					}
				}//fin for
				$("#tbl_cred_garan_fiduciarios").html(gtia1);
				$("#tbl_cred_garan_hipotecaria").html(gtia2);
				$("#tbl_cred_garan_prendaria").html(gtia3);
				
				//cargamos el listview de las garantias
				$("#warrantReview").listview({create: function( event, ui ) {} });
				$("#warrantReview").listview("refresh");
				$("#tbl_cred_garan_fiduciarios").listview("refresh");
				$("#tbl_cred_garan_hipotecaria").listview("refresh");
				$("#tbl_cred_garan_prendaria").listview("refresh");
				
				$(".itemGar").addClass("ui-btn-icon-right ui-icon-carat-r");
			}
		});
		db.transaction(function(tx){
			tx.executeSql("SELECT COUNT(FORM) FIDUCIARIO,(SELECT COUNT(FORM) FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE g.ID_SOL = ? AND CUSTOMER_REQUESTS = ? AND FORM = 6 AND ELIMINADA=0) HIPOTECARIO,(SELECT COUNT(FORM) FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE g.ID_SOL = ? AND CUSTOMER_REQUESTS = ? AND FORM = 7 AND ELIMINADA=0) PRENDARIO FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE g.ID_SOL = ? AND FORM = 1 AND ELIMINADA=0",[idSolicitud,idCliente,idSolicitud,idCliente,idSolicitud],function(tx,results){
				var cant_fidu = results.rows.item(0).FIDUCIARIO;
				var cant_hipo = results.rows.item(0).HIPOTECARIO;
				var cant_pren = results.rows.item(0).PRENDARIO;
				
				$("#tbl_cred_garan_fiduciarios").parent().parent().find('h2').find('a').find('span').html(cant_fidu);
				$("#tbl_cred_garan_hipotecaria").parent().parent().find('h2').find('a').find('span').html(cant_hipo);
				$("#tbl_cred_garan_prendaria").parent().parent().find('h2').find('a').find('span').html(cant_pren);
			});
		},function(){});
	}, app.webdb.onError);
}

function guardarFormulario(idDiv, btn)
{
	app.creditea.verificarLogin(1);
	if(!$(btn).attr("disabled")){
		$(btn).attr("disabled","disabled");
		var jsonText;
		var idForm;
		var flag = 0;//0 todas los campos son validos
		var nomForm = '';
		//alert('En construccion, guardarFormulario('+idDiv+')');	
		//validar los input requeridos
		//style="border:0px none rgb(51, 51, 51)"<--valor defecto
		$.each($('#'+idDiv+' input[required="required"]'), function(index, input){
			if(input.value.trim().length == 0){
				$(input).css({'background-color':'red', "color":"white"});
				flag = 1;
			} else {//retornar el estilo a lo normal
				if(input.value  == "0.00"){
					$(input).css({'background-color':'red', "color":"white"});
					flag = 1;
				} else {
					$(input).css({'background-color':'white', "color":"black"});
				}
			}
		});
		$.each($('#'+idDiv+' select[required="required"]'), function(index, input){
			var myselect = $("#"+input.id);
			if(myselect[0].selectedIndex == 0){
				myselect.selectmenu("refresh");
				myselect.parent().css({"background-color":"red"});
				flag = 1;
			} else {
				// myselect.parent().css({"background-color":"#009245"});
			}
		});
		if(idDiv == 'div_datosGenerales'){
			idForm = 1;
		}
		else if(idDiv == 'div_datosCreditos'){
			idForm = 2;
			nomForm = 'creditos';
		}
		else if(idDiv == 'div_ahorros'){
			idForm = 3;
			nomForm = 'ahorros';
		}
		else if(idDiv == 'div_depositosPlazo'){
			idForm = 4;
			nomForm = 'depositos a plazo';
		}
		else if(idDiv == 'div_fiduciario'){
			if($("#txt_fidu_total").NumBox("getRaw") <= 0 ){
				$("#txt_fidu_total").css({'background-color':'red', "color":"white"});
				flag = 1;
			} else {//retornar el estilo a lo normal
				$("#txt_fidu_total").css({'background-color':'rgb(194, 192, 180)', "color":"black"});
			}
			if($("#txt_fidu_totalIngresos").NumBox("getRaw") <= 0){
				$("#txt_fidu_totalIngresos").css({'background-color':'red', "color":"white"});
				flag = 1;
			} else {//retornar el estilo a lo normal
				$("#txt_fidu_totalIngresos").css({'background-color':'rgb(194, 192, 180)', "color":"black"});
			}
			idForm = 5;
		}
		else if(idDiv == 'div_hipotecaria'){
			if($("#txt_cap_total_avaluo").NumBox("getRaw") <= 0){
				$("#txt_cap_total_avaluo").css({'background-color':'red', "color":"white"});
				flag = 1;
			} else {//retornar el estilo a lo normal
				$("#txt_cap_total_avaluo").css({'background-color':'white', "color":"black"});
			}
			idForm = 6;
		}
		else if(idDiv == 'div_prendaria') {
			idForm = 7;
		}
		else if(idDiv == 'div_remesas'){
			idForm = 8;	
			nomForm = 'remesas';
		}
		else if(idDiv == 'div_evalFinanciera'){
			idForm = 9;	
		}
		else if(idDiv == 'div_resolucion'){
			idForm = 10;	
		}
		else if(idDiv == 'div_facturacion'){
			if(!$("#hd_fac_trans_1").length){
				alert('Debe Ingresar por lo menos una transacción.');
				$(btn).removeAttr("disabled");
				return;
			}
			idForm = 666;	
		}
		
		//obtener los id y sus valores al ser almacenados en la base
		if(flag == 0){//todos los input son validos
			jsonText = '{"idFormulario":"'+idForm+'",';
			//recorrido de los input
			$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
				var campo = input.id;
				if(idDiv == 'div_fiduciario'){
					campo = campo.replace("txt_fidu_","txt_");
				}
				if(campo.indexOf("img_") != -1) {
					jsonText += '"'+campo+'":"'+input.value+'",';
				} else {
					jsonText += '"'+campo+'":"'+input.value.toUpperCase().replace(/\"/g, "\\\"")+'",';
				}
				//app_log(index + ")Id:"+input.id+", VALUE: " + input.value);
			});
			//recorrido de los combo box
			$.each($('#'+idDiv+' select'), function(index, select){
				var seleccion = select.id
				if(idDiv == 'div_fiduciario'){
					seleccion = seleccion.replace("cb_fidu_","cb_");
				}
				jsonText += '"'+seleccion+'":"'+select.value+'",';
				//app_log(index + ")Id:"+select.id+", VALUE: " + select.value);
			});
			//recorrido de los text area
			$.each($('#'+idDiv+' textarea'), function(index, textarea){
				var texto = textarea.id;
				if(idDiv == 'div_fiduciario'){
					texto = texto.replace("txt_fidu_","txt_");
				}
				jsonText += '"'+texto+'":"'+textarea.value.replace(/\"/g, "\\\"").replace(new RegExp('\r?\n','g'), '\\r\\n')+'",';
				//app_log(index + ")Id:"+select.id+", VALUE: " + select.value);
			});
			//recorrido de las facturas cuando aplica
			if(idDiv == 'div_facturacion'){
				var flag_fac = 1;
				var index_cod;
				var campo_fac;
				$.each($('#details tr[id!="nothing"] td'), function(index, tdText){
					if(flag_fac == 5)
						flag_fac = 1;
					if(flag_fac == 1){
						index_cod = $(tdText).text();
						campo_fac = 'codigo'+'_'+index_cod;
					}else if(flag_fac == 2){
						campo_fac = 'transaccion'+'_'+index_cod;
					}else if(flag_fac == 3){
						campo_fac = 'num_cuenta'+'_'+index_cod;
					}else if(flag_fac == 4){
						campo_fac = 'valor'+'_'+index_cod;
					}
					jsonText += '"'+campo_fac+'":"'+$(tdText).text()+'",';
					flag_fac++;
					//app_log(index + ")Text: " + $(tdText).text());
				});
			}
			jsonText = jsonText.substr(0,jsonText.length-1);
			jsonText += '}';
			//app_log(jsonText);
			//almacenar en la base de datos
			var db = app.webdb.db;
			var insert = "INSERT INTO STORAGE(FORM,FORM_RESPONSE,DATE_CREATED,DATE_UPDATED, ID_DIV,CUSTOMER_REQUESTS, COD_SESS) VALUES(?,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),strftime('%Y-%m-%d %H:%M:%S','now','localtime'),?,?,?||strftime('%Y%m%d%H%M%S','now','localtime'))";
			//llenar el objeto cliente.
			if(idDiv == 'div_datosGenerales'){
				if($("#img_cliente_firma_hd").val().length==0 && $("#img_cliente_iden_frontal_hd").val().length==0 && $("#img_cliente_iden_trasera_hd").val().length==0)
				{
					alert('No se han ingresado las capturas');
				} else {
					db.transaction(function(tx){
						tx.executeSql("SELECT ID_CAP_CUSTOMER, FORM_RESPONSE FROM CAP_CUSTOMER c INNER JOIN STORAGE s ON c.ID_CAP_CUSTOMER=S.CUSTOMER_REQUESTS WHERE FORM=1 AND TYPE_IDENTITY = ? AND IDENTITY = ?",[$('#cb_tipoIdentificacion').find('option:selected').val(),$('#orgIdentity').val()],
							function(tx,results){
								var len = results.rows.length;
								if(len != 0){//update cliente
									var prow = results.rows.item(0);
									var response = JSON.parse(prow['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
									var jsonR = JSON.parse(jsonText);
									var jsonResult = {};
									$.each(response, function(input, value){
										if (typeof jsonResult[input] == 'undefined') {
											jsonResult[input] = value;
										}
									});
									$.each(jsonR, function(input, value){
										if (typeof jsonResult[input] == 'undefined') {
											jsonResult[input] = value;
										} else {
											if(jsonResult[input] != value){
												jsonResult[input] = value;
											}
										}
									});
									
									var updateCap = "UPDATE CAP_CUSTOMER SET firstname=?,midname=?,lastname1=?,lastname2=?,gender=?,birthday=?,nationality=?,ocupation=?,education=?, patrimony=?, DATE_UPDATED=strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE ID_CAP_CUSTOMER = ?";
									tx.executeSql(updateCap,[$('#txt_primerNombre').val(),$('#txt_segundoNombre').val(),$('#txt_primerApellido').val(),$('#txt_segundoApellido').val(),$('#cb_tipoSexo').find('option:selected').val(),$('#txt_fechaNacimiento').val(),$('#txt_nacionalidad').val(),$('#cb_profecion').find('option:selected').val(),$('#cb_nivelEducativo').find('option:selected').val(),$('#hd_patrimonio').val(), clientGlobal.getId()]);
									var updCliente = "UPDATE STORAGE SET FORM_RESPONSE = ?, DATE_UPDATED = strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE CUSTOMER_REQUESTS = ? AND FORM = 1";
									tx.executeSql(updCliente,[JSON.stringify(jsonResult),clientGlobal.getId()],function(tx,results){
										$.each($('#'+idDiv+' img'), function(index, img){
											tx.executeSql("UPDATE FOTOS SET FOTO = ? WHERE ID_FOTO = (SELECT ID_FOTO FROM FOTOS WHERE ID_STORAGE = (SELECT ID FROM STORAGE WHERE CUSTOMER_REQUESTS = ? AND FORM = 1) AND ID_IMG = ?)",[$('#'+img.id+'_hd').val(),clientGlobal.getId(),img.id]);
										});
										alert("La informacion del "+clientGlobal.getNombreCompleto()+" fue modificada, exitosamente.");
										//limpiamos el formulario
										limpiarForm(idDiv);
										$(btn).removeAttr("disabled");
										irOpcion('clientes_list');
									});
								} else {
									//insertar nuevo cliente
									clientGlobal = new Cliente();
									var insCliente = "INSERT INTO cap_customer(firstname,midname,lastname1,lastname2,type_identity,identity,gender,birthday,status,nationality,ocupation,education,patrimony, active,date_created, DATE_UPDATED, AGENCIA) ";
									insCliente += "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),strftime('%Y-%m-%d %H:%M:%S','now','localtime'), ?)";
									tx.executeSql(insCliente,[$('#txt_primerNombre').val().toUpperCase(),$('#txt_segundoNombre').val().toUpperCase(),$('#txt_primerApellido').val().toUpperCase(),$('#txt_segundoApellido').val().toUpperCase(),$('#cb_tipoIdentificacion').find('option:selected').val(),$('#txt_noIdentidad').val(),$('#cb_tipoSexo').find('option:selected').val(),$('#txt_fechaNacimiento').val(),1,$('#txt_nacionalidad').val().toUpperCase(),$('#cb_profecion').find('option:selected').val(),$('#cb_nivelEducativo').find('option:selected').val(),$('#hd_patrimonio').val(),1, userLoginGlobal.getCompanyId()],
										function(tx,results){
											var id = results.insertId;
											app_log("id:"+id);
											clientGlobal.cargarDatos(id);//toma los valores de los input's
											tx.executeSql(insert,['1',jsonText,idDiv,id,userLoginGlobal.getUserid()],
												function(tx, results){//insersion con exito
												var id_storage = results.insertId;
												//recorrido de las imagenes
												$.each($('#'+idDiv+' img'), function(index, img){
													tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
												});										
												//------------------------------------
												$('#div_contentMessage').html('El perfil del cliente <h2>'+$('#txt_primerNombre').val().toUpperCase()+' '+$('#txt_segundoNombre').val()+' '+$('#txt_primerApellido').val().toUpperCase()+' '+$('#txt_segundoApellido').val().toUpperCase()+'</h2><br/>ha sido creado exitosamente.');
												//limpiamos el formulario
												limpiarForm(idDiv);
												
												//--------enviar mensaje de exito-------
												$('#div_subMessage').hide();
												$('#div_sel_producto').show();
												$('#btn_sel_producto').show();
												//-----------llenar los formularios
												$('#txt_aho_noIdentidad').val(clientGlobal.getNoIdentidad());
												$('#txt_desPlazos_noIdentidad').val(clientGlobal.getNoIdentidad());
												$('#txt_cred_noIdentidad').val(clientGlobal.getNoIdentidad());
												$('#txt_fidu_noIdentidad').val(clientGlobal.getNoIdentidad());
												$('#txt_hipo_noIdentidad').val(clientGlobal.getNoIdentidad());
												$('#txt_pren_noIdentidad').val(clientGlobal.getNoIdentidad());
												
												$('#txt_aho_nombre').val(clientGlobal.getNombreCompleto());
												$('#txt_desPlazos_nombre').val(clientGlobal.getNombreCompleto());
												$('#txt_cred_nombre').val(clientGlobal.getNombreCompleto());
												$('#txt_fidu_nombre').val(clientGlobal.getNombreCompleto());
												$('#txt_hipo_nombre').val(clientGlobal.getNombreCompleto());
												$('#txt_pren_nombre').val(clientGlobal.getNombreCompleto());
												
												$('#txt_aho_codCliente').val(clientGlobal.getId());
												$('#txt_desPlazos_codCliente').val(clientGlobal.getId());
												$('#txt_cred_codCliente').val(clientGlobal.getId());
												$('#txt_fidu_codCliente').val(clientGlobal.getId());
												$('#txt_hipo_codCliente').val(clientGlobal.getId());
												$('#txt_pren_codCliente').val(clientGlobal.getId());
												
												$('#txt_fac_nombre').val(clientGlobal.getNombreCompleto());
												$('#txt_fac_identidad').val(clientGlobal.getNoIdentidad());
												$('#txt_fac_usuario').val(userLoginGlobal.getNombre());
												$('#txt_fac_fecha').val(formatDate(new Date()))
												
												$('#mt_patrimonio').NumBox('setRaw',clientGlobal.getPatrimonio());
												//irOpcion('msgExitos');
												alert("La informacion de "+clientGlobal.getNombreCompleto()+" fue ingresada, exitosamente.");
												$(btn).removeAttr("disabled");
												irOpcion('clientes_list');
											},app.webdb.onError);
										}//fin result
									);
								}
							}//fin tx,results
						);
					},app.webdb.onError);
				}
			}
			else if(idDiv == 'div_fiduciario'){
				if($("#img_fidu_cliente_firma_hd").val().length==0 && $("#img_fidu_cliente_iden_frontal_hd").val().length==0 && $("#img_fidu_cliente_iden_trasera_hd").val().length==0)
				{
					alert('El aval no tiene capturas actualize el perfil.');
				} else {
					var tipo_iden = $('#'+idDiv+' #cb_fidu_tipoIdentificacion').find('option:selected').val();
					var identidad = $('#'+idDiv+' #txt_fidu_noIdentidad').val();
					
					db.transaction(function(tx){
						tx.executeSql("SELECT ID_CAP_CUSTOMER, FORM_RESPONSE FROM CAP_CUSTOMER c INNER JOIN STORAGE s ON c.ID_CAP_CUSTOMER=S.CUSTOMER_REQUESTS WHERE FORM=1 AND TYPE_IDENTITY = ? AND IDENTITY = ?",[tipo_iden, identidad],
							function(tx,results){
								var len = results.rows.length;
								if(len != 0) {//update cliente
									var prow = results.rows.item(0);
									fidu_id = prow["ID_CAP_CUSTOMER"];
									var response = JSON.parse(prow['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
									var jsonR = JSON.parse(jsonText);
									var jsonResult = {};
									$.each(response, function(input, value){
										if (typeof jsonResult[input] == 'undefined') {
											jsonResult[input] = value;
										}
									});
									$.each(jsonR, function(input, value){
										if (typeof jsonResult[input] == 'undefined') {
											jsonResult[input] = value;
										} else {
											if(jsonResult[input] != value){
												jsonResult[input] = value;
											}
										}
									});
									
									var updateCap = "UPDATE CAP_CUSTOMER SET firstname=?,midname=?,lastname1=?,lastname2=?,gender=?,birthday=?,nationality=?,ocupation=?,education=?, patrimony=? WHERE ID_CAP_CUSTOMER = ?";
									tx.executeSql(updateCap,[$('#txt_fidu_primerNombre').val(),$('#txt_fidu_segundoNombre').val(),$('#txt_fidu_primerApellido').val(),$('#txt_fidu_segundoApellido').val(),$('#cb_fidu_tipoSexo').find('option:selected').val(),$('#txt_fidu_fechaNacimiento').val(),$('#txt_fidu_nacionalidad').val(),$('#cb_fidu_profecion').find('option:selected').val(),$('#cb_fidu_nivelEducativo').find('option:selected').val(),$('#hd_fidu_patrimonio').val(), fidu_id]);
									var updCliente = "UPDATE STORAGE SET FORM_RESPONSE = ?, DATE_UPDATED = strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE CUSTOMER_REQUESTS = ? AND FORM = 1";
									tx.executeSql(updCliente,[JSON.stringify(jsonResult),fidu_id],function(tx,results){
										var id_garantia = $('#editForm'+idForm).val();
										var id_solicitud = $("#credId_gtia_fidu").val();
										tx.executeSql("SELECT * FROM GARANTIAS WHERE ID_SOL=? AND ID_GAR=? AND ELIMINADA=0", [id_solicitud,id_garantia], function(tx, results){
											var len = results.rows.length;
											if(len == 0){
												tx.executeSql("INSERT INTO GARANTIAS(ID_SOL,ID_GAR,STATE,ID_USER,DATE_CREATED, ELIMINADA) VALUES(?,?,1,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),0)",[id_solicitud,id_garantia,userLoginGlobal.getUserid()]);
											}									
										});
										
										$.each($('#'+idDiv+' img'), function(index, img){
											tx.executeSql("UPDATE FOTOS SET FOTO = ? WHERE ID_FOTO = (SELECT ID_FOTO FROM FOTOS WHERE ID_STORAGE = (SELECT ID FROM STORAGE WHERE CUSTOMER_REQUESTS = ? AND FORM = 1) AND ID_IMG = ?)",[$('#'+img.id+'_hd').val(),clientGlobal.getId(),img.id]);
										});
										//limpiar el formulario
										limpiarForm(idDiv);
										mostrarGarantias($("#credId_gtia_fidu").val());		
										alert("El formulario se actualizo exitosamente.");
										$(btn).removeAttr("disabled");
										irOpcion('creditos');
									});
								}
								
							} //fin tx,results
						);
					},app.webdb.onError);
				}
			}
			else {//else de div_fiduciario
				if(idForm == 5 || idForm == 6 || idForm == 7 || idForm == 9 || idForm == 10) {
					var fid = 0;
					var combo = $("#cb_cred_producto").find("option:selected");
					idProd = combo.val();
					if(idForm ==5 ) {
						fid = $("#credId_gtia_fidu").val();
					} else if(idForm == 6) {
						fid = $("#credId_gtia_hipo").val();
					} else if(idForm == 7) {
						fid = $("#credId_gtia_pren").val();
					} else if(idForm == 9) {
						fid = $("#credId_eval_fin").val();
					} else if(idForm == 10) {
						fid = $("#credId_resolucion").val();
					}
					
					if($('#editForm'+idForm).length && $('#editForm'+idForm).val() > 0){
						db.transaction(function(tx){
							update = "UPDATE STORAGE SET FORM_RESPONSE = ?, DATE_UPDATED = strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE ID = ? ";
							tx.executeSql(update,[jsonText, $('#editForm'+idForm).val()],function(tx, results){
								var id_storage = $('#editForm'+idForm).val();
								tx.executeSql("SELECT * FROM GARANTIAS WHERE ID_SOL=? AND ID_GAR=? AND ELIMINADA=0",[fid,id_storage], function(tx, results){
									var len = results.rows.length;
									if(len == 0){
										tx.executeSql("INSERT INTO GARANTIAS(ID_SOL,ID_GAR,STATE,ID_USER,DATE_CREATED, ELIMINADA) VALUES(?,?,1,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),0)",[fid,id_storage,userLoginGlobal.getUserid()]);
									}
								});
								//recorrido de las imagenes
								$.each($('#'+idDiv+' img'), function(index, img){
									tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
								});
								mostrarGarantias(fid);
							});
						},app.webdb.onError, function() {
							//proceso de limpiar el formulario
							$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
								//no limpiar el encabezado del cliente en cada form
								if(input.id == 'txt_aho_noIdentidad' || input.id == 'txt_desPlazos_noIdentidad' || input.id == 'txt_cred_noIdentidad' || 
										input.id == 'txt_fidu_noIdentidad' || input.id == 'txt_hipo_noIdentidad' || input.id == 'txt_pren_noIdentidad' || 
										input.id == 'txt_aho_nombre' || input.id == 'txt_desPlazos_nombre' || input.id == 'txt_cred_nombre' || 
										input.id == 'txt_fidu_nombre' || input.id == 'txt_hipo_nombre' || input.id == 'txt_pren_nombre' || 
										input.id == 'txt_aho_codCliente' || input.id == 'txt_desPlazos_codCliente' || input.id == 'txt_cred_codCliente' || 
										input.id == 'txt_fidu_codCliente' || input.id == 'txt_hipo_codCliente' || input.id == 'txt_pren_codCliente' ||
										input.id == 'txt_rem_noIdentidad' || input.id == 'txt_rem_nombre' || input.id == 'txt_rem_codCliente')
									app_log('nada pasa');
								else
									$(input).val("");
							});
							$.each($('#'+idDiv+' select'), function(index, select){
								$(select).val($(select).children('option:first').val());
								$(select).selectmenu('refresh');
							});
							$.each($('#'+idDiv+' textarea'), function(index, input){
								$(input).val("");
							});
							$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
								$(input).attr("src","");
							});
							$('#editForm'+idForm).val(0);
							$('#'+idDiv+' #div_evaluacionCaptura').collapsible("collapse");
							alert("El formulario se actualizo exitosamente.");
							$(btn).removeAttr("disabled");
							irOpcion('creditos');
						});
					} else {
						db.transaction(function(tx){
							insert = "INSERT INTO STORAGE(FORM,SUB_FORM,FORM_PROD,FORM_RESPONSE,DATE_CREATED,DATE_UPDATED,ID_DIV,CUSTOMER_REQUESTS,COD_SESS) VALUES(?,?,?,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),strftime('%Y-%m-%d %H:%M:%S','now','localtime'),?,?,?||strftime('%Y%m%d%H%M%S','now','localtime'))";
							combo = $("#cb_cred_producto").find("option:selected");
							subform = idForm==7?($("#cb_pren_tipoGaranPrendaria").find('option:selected').val()):0;
							tx.executeSql(insert,[idForm,subform,idProd,jsonText,idDiv,clientGlobal.getId(),userLoginGlobal.getUserid()],function(tx, results){
								var id_storage = results.insertId;
								tx.executeSql("INSERT INTO GARANTIAS(ID_SOL,ID_GAR,STATE,ID_USER,DATE_CREATED, ELIMINADA) VALUES (?,?,1,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),0)",[fid,id_storage,userLoginGlobal.getUserid()]);
								//recorrido de las imagenes
								$.each($('#'+idDiv+' img'), function(index, img){
									tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
								});
								mostrarGarantias(fid);
							});
						},app.webdb.onError, function() {
							//proceso de limpiar el formulario
							$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
								//no limpiar el encabezado del cliente en cada form
								if(input.id == 'txt_aho_noIdentidad' || input.id == 'txt_desPlazos_noIdentidad' || input.id == 'txt_cred_noIdentidad' || 
										input.id == 'txt_fidu_noIdentidad' || input.id == 'txt_hipo_noIdentidad' || input.id == 'txt_pren_noIdentidad' || 
										input.id == 'txt_aho_nombre' || input.id == 'txt_desPlazos_nombre' || input.id == 'txt_cred_nombre' || 
										input.id == 'txt_fidu_nombre' || input.id == 'txt_hipo_nombre' || input.id == 'txt_pren_nombre' || 
										input.id == 'txt_aho_codCliente' || input.id == 'txt_desPlazos_codCliente' || input.id == 'txt_cred_codCliente' || 
										input.id == 'txt_fidu_codCliente' || input.id == 'txt_hipo_codCliente' || input.id == 'txt_pren_codCliente' ||
										input.id == 'txt_rem_noIdentidad' || input.id == 'txt_rem_nombre' || input.id == 'txt_rem_codCliente')
									app_log('nada pasa');
								else
									$(input).val("");
							});
							$.each($('#'+idDiv+' select'), function(index, select){
								$(select).val($(select).children('option:first').val());
								$(select).selectmenu('refresh');
							});
							$.each($('#'+idDiv+' textarea'), function(index, input){
								$(input).val("");
							});
							$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
								$(input).attr("src","");
							});
							$('#'+idDiv+' #div_evaluacionCaptura').collapsible("collapse");
							$('#editForm'+idForm).val(0);
							alert("El formulario se guardo exitosamente.");
							$(btn).removeAttr("disabled");
							irOpcion('creditos');
						});
					}
				} 
				else {
					if($('#editForm'+idForm).length && $('#editForm'+idForm).val() > 0){
						db.transaction(function(tx){
							update = "UPDATE STORAGE SET FORM_RESPONSE = ?, DATE_UPDATED = strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE ID = ? ";
							tx.executeSql(update,[jsonText, $('#editForm'+idForm).val()],function(tx, results){
								var id_storage = $('#editForm'+idForm).val();
								//recorrido de las imagenes
								$.each($('#'+idDiv+' img'), function(index, img){
									tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
								});
								mostrarGarantias(fid);
							});
						},app.webdb.onError, function() {
							//proceso de limpiar el formulario
							$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
								//no limpiar el encabezado del cliente en cada form
								if(input.id == 'txt_aho_noIdentidad' || input.id == 'txt_desPlazos_noIdentidad' || input.id == 'txt_cred_noIdentidad' || 
										input.id == 'txt_fidu_noIdentidad' || input.id == 'txt_hipo_noIdentidad' || input.id == 'txt_pren_noIdentidad' || 
										input.id == 'txt_aho_nombre' || input.id == 'txt_desPlazos_nombre' || input.id == 'txt_cred_nombre' || 
										input.id == 'txt_fidu_nombre' || input.id == 'txt_hipo_nombre' || input.id == 'txt_pren_nombre' || 
										input.id == 'txt_aho_codCliente' || input.id == 'txt_desPlazos_codCliente' || input.id == 'txt_cred_codCliente' || 
										input.id == 'txt_fidu_codCliente' || input.id == 'txt_hipo_codCliente' || input.id == 'txt_pren_codCliente' ||
										input.id == 'txt_rem_noIdentidad' || input.id == 'txt_rem_nombre' || input.id == 'txt_rem_codCliente')
									app_log('nada pasa');
								else
									$(input).val("");
							});
							$.each($('#'+idDiv+' select'), function(index, select){
								$(select).val($(select).children('option:first').val());
								$(select).selectmenu('refresh');
							});
							$.each($('#'+idDiv+' textarea'), function(index, input){
								$(input).val("");
							});
							$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
								$(input).attr("src","");
							});
							$('#editForm'+idForm).val(0);
							if(idForm == 2){
								$("#tbl_cred_garan_fiduciarios").html("");
								$("#tbl_cred_garan_fiduciarios").parent().parent().find('h2').find('a').find('span').html("0");
								$("#tbl_cred_garan_hipotecaria").html("");
								$("#tbl_cred_garan_hipotecaria").parent().parent().find('h2').find('a').find('span').html("0");
								$("#tbl_cred_garan_prendaria").html("");
								$("#tbl_cred_garan_prendaria").parent().parent().find('h2').find('a').find('span').html("0");
								//cargamos el listview de las garantias
								$("#warrantReview").listview({create: function( event, ui ) {} });
								$("#warrantReview").listview("refresh");
							}
							//alert("Formulario almacenado con exito.");
							idCliente = clientGlobal.getId();
							db.transaction(function(tx){
								tx.executeSql("SELECT COUNT(FORM) CREDITOS,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 3) CUENTA_AHORRO,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 4) DEPOSITO_PLAZO,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 8) REMESAS FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 2",[idCliente,idCliente,idCliente,idCliente],function(tx,results){
									var cant_creditos = results.rows.item(0).CREDITOS;
									var cant_ahorro = results.rows.item(0).CUENTA_AHORRO;
									var cant_depPlazo = results.rows.item(0).DEPOSITO_PLAZO;
									var cant_remesas = results.rows.item(0).REMESAS;
									$('#sol_credit_ing').html(cant_creditos);
									$('#sol_cue_ahorro').html(cant_ahorro);
									$('#sol_depos').html(cant_depPlazo);
									$('#sol_remesas').html(cant_remesas);
									
									if(cant_creditos > 0) {
										$('#sol_credit_ing').parent().wrap('<a id="prodLstCrd" data-stype="credito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
									}
									if(cant_ahorro > 0) {
										$('#sol_cue_ahorro').parent().wrap('<a id="prodLstAho" data-stype="ahorro" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
									}
									if(cant_depPlazo > 0) {
										$('#sol_depos').parent().wrap('<a id="prodLstDep" data-stype="deposito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
									}
									if(cant_remesas > 0) {
										$('#sol_remesas').parent().wrap('<a id="prodLstRem" data-stype="remesa" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
									}
								});
							},function(){},//error
							function(){//exito
								//--------enviar mensaje de exito-------
								if(nomForm.length != 0){
									$('#div_contentMessage').html('El formulario de '+nomForm+' se actualizo exitosamente.');
									$('#div_subMessage').html('Estatus: <strong>completa</strong>');
									$('#div_subMessage').show();
									$('#div_sel_producto').hide();
									$('#btn_sel_producto').hide();
									$('#lnkMsgExitoReturn').removeAttr("onclick");
									$('#lnkMsgExitoReturn').one('click', function(){
										$(btn).removeAttr("disabled");
										irOpcion('productos');
									});
									$(btn).removeAttr("disabled");
									irOpcion('msgExitos');
								} else if(idForm == 5 || idForm == 6 || idForm == 7 || idForm == 9 || idForm == 10){
									alert("El formulario se guardo exitosamente.");
									$(btn).removeAttr("disabled");
									irOpcion('creditos');
								} else {
									$('#div_contentMessage').html('El formulario se actualizo exitosamente.');
									$('#div_subMessage').html('Estatus: <strong>completa</strong>');
									$('#div_subMessage').show();
									$('#div_sel_producto').hide();
									$('#btn_sel_producto').hide();
									$(btn).removeAttr("disabled");
									irOpcion('msgExitos');
									//irOpcion('productos');
								}
							});
						});
					} 
					else {
						db.transaction(function(tx){
							insert = "INSERT INTO STORAGE(FORM,FORM_PROD,FORM_RESPONSE,DATE_CREATED,DATE_UPDATED, ID_DIV, CUSTOMER_REQUESTS, COD_SESS) VALUES(?,?,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),strftime('%Y-%m-%d %H:%M:%S','now','localtime'),?,?,?||strftime('%Y%m%d%H%M%S','now','localtime'))";
							//OBTENEMOS producto de acuerdo al formulario
							var idProd = 0;
							var combo;
							var params =[];
							if(idForm == 2 || idForm == 5 || idForm == 6 || idForm == 7 || idForm == 9 || idForm == 10){
								 params = [idForm,idProd,jsonText,idDiv,clientGlobal.getId(),userLoginGlobal.getUserid()];
								combo = $("#cb_cred_producto").find("option:selected");
								idProd = combo.val();
							} else if(idForm==3){
								 params = [idForm,idProd,jsonText,idDiv,clientGlobal.getId(),userLoginGlobal.getUserid()];
								combo = $("#cb_aho_producto").find("option:selected");
								idProd = combo.val();
							} else if(idForm==4){
								 params = [idForm,idProd,jsonText,idDiv,clientGlobal.getId(),userLoginGlobal.getUserid()];
								combo = $("#cb_desPlazos_producto").find("option:selected");
								idProd = combo.val();
							} else if(idForm==8){
								if(typeof clientGlobal == 'undefined'){
									params = [idForm,idProd,jsonText,idDiv,0,userLoginGlobal.getUserid()];
								} else {
									params = [idForm,idProd,jsonText,idDiv,clientGlobal.getId(),userLoginGlobal.getUserid()];
								}
								idProd = 13;
							} else if(idForm==666){
								if(typeof clientGlobal == 'undefined'){
									params = [idForm,idProd,jsonText,idDiv,0,userLoginGlobal.getUserid()];
								} else {
									params = [idForm,idProd,jsonText,idDiv,clientGlobal.getId(),userLoginGlobal.getUserid()];
								}
							}
							tx.executeSql(insert,params,function(tx, results){
								var id_storage = results.insertId;
								//recorrido de las imagenes
								$.each($('#'+idDiv+' img'), function(index, img){
									tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
								});
							});
						},
						app.webdb.onError,
						function(){//insersion con exito
							//proceso de limpiar el formulario
							$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
								//no limpiar el encabezado del cliente en cada form
								if(input.id == 'txt_aho_noIdentidad' || input.id == 'txt_desPlazos_noIdentidad' || input.id == 'txt_cred_noIdentidad' || 
										input.id == 'txt_fidu_noIdentidad' || input.id == 'txt_hipo_noIdentidad' || input.id == 'txt_pren_noIdentidad' || 
										input.id == 'txt_aho_nombre' || input.id == 'txt_desPlazos_nombre' || input.id == 'txt_cred_nombre' || 
										input.id == 'txt_fidu_nombre' || input.id == 'txt_hipo_nombre' || input.id == 'txt_pren_nombre' || 
										input.id == 'txt_aho_codCliente' || input.id == 'txt_desPlazos_codCliente' || input.id == 'txt_cred_codCliente' || 
										input.id == 'txt_fidu_codCliente' || input.id == 'txt_hipo_codCliente' || input.id == 'txt_pren_codCliente' ||
										input.id == 'txt_rem_noIdentidad' || input.id == 'txt_rem_nombre' || input.id == 'txt_rem_codCliente')
									app_log('nada pasa');
								else
									$(input).val("");
							});
							$.each($('#'+idDiv+' select'), function(index, select){
								$(select).val($(select).children('option:first').val());
								$(select).selectmenu('refresh');
							});
							$.each($('#'+idDiv+' textarea'), function(index, input){
								$(input).val("");
							});
							$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
								$(input).attr("src","");
							});
							if(idForm == 2){
								$("#tbl_cred_garan_fiduciarios").html("");
								$("#tbl_cred_garan_fiduciarios").parent().parent().find('h2').find('a').find('span').html("0");
								$("#tbl_cred_garan_hipotecaria").html("");
								$("#tbl_cred_garan_hipotecaria").parent().parent().find('h2').find('a').find('span').html("0");
								$("#tbl_cred_garan_prendaria").html("");
								$("#tbl_cred_garan_prendaria").parent().parent().find('h2').find('a').find('span').html("0");
								//cargamos el listview de las garantias
								$("#warrantReview").listview({create: function( event, ui ) {} });
								$("#warrantReview").listview("refresh");
							}
							//alert("Formulario almacenado con exito.");
							if(idForm == 666){
								$('#details tr[id!="nothing"]').remove();
								$('#details tr[id="nothing"]').show();
								$("#lbl_fac_total").autoNumeric('set',0);
								$('#hd_seq').val(1);
							}
							if(typeof clientGlobal == 'undefined') {
								idCliente = 0;
							} else {
								idCliente = clientGlobal.getId();
							}						
							db.transaction(function(tx){
								tx.executeSql("SELECT COUNT(FORM) CREDITOS,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 3) CUENTA_AHORRO,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 4) DEPOSITO_PLAZO,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 8) REMESAS FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 2",[idCliente,idCliente,idCliente,idCliente],function(tx,results){
									var cant_creditos = results.rows.item(0).CREDITOS;
									var cant_ahorro = results.rows.item(0).CUENTA_AHORRO;
									var cant_depPlazo = results.rows.item(0).DEPOSITO_PLAZO;
									var cant_remesas = results.rows.item(0).REMESAS;
									$('#sol_credit_ing').html(cant_creditos);
									$('#sol_cue_ahorro').html(cant_ahorro);
									$('#sol_depos').html(cant_depPlazo);
									$('#sol_remesas').html(cant_remesas);
									
									if(cant_creditos > 0) {
										$('#sol_credit_ing').parent().wrap('<a id="prodLstCrd" data-stype="credito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
									}
									if(cant_ahorro > 0) {
										$('#sol_cue_ahorro').parent().wrap('<a id="prodLstAho" data-stype="ahorro" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
									}
									if(cant_depPlazo > 0) {
										$('#sol_depos').parent().wrap('<a id="prodLstDep" data-stype="deposito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
									}
									if(cant_remesas > 0) {
										$('#sol_remesas').parent().wrap('<a id="prodLstRem" data-stype="remesa" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
									}
								});
							},
							function(){
								alert('no se inserto');
							},//error
							function(){//exito
								//--------enviar mensaje de exito-------
								if(nomForm.length != 0){
									$('#div_contentMessage').html('El formulario de '+nomForm+' se guardo exitosamente.');
									$('#div_subMessage').html('Estatus: <strong>completa</strong>');
									$('#div_subMessage').show();
									$('#div_sel_producto').hide();
									$('#btn_sel_producto').hide();
									if(idForm == 8){
										$('#lnkMsgExitoReturn').one('click', function(){
											$(btn).removeAttr("disabled");
											irOpcion('principal');
										});
									} else {
										$('#lnkMsgExitoReturn').one('click', function(){
											$(btn).removeAttr("disabled");
											irOpcion('productos');
										});
									}
									irOpcion('msgExitos');
								} else if(idForm == 5 || idForm == 6 || idForm == 7 || idForm == 9 || idForm == 10){
									alert("El formulario se guardo exitosamente.");
									$(btn).removeAttr("disabled");
									irOpcion('creditos');
								} else {
									$('#div_contentMessage').html('El formulario se guardo exitosamente.');
									$('#div_subMessage').html('Estatus: <strong>completa</strong>');
									$('#div_subMessage').show();
									$('#div_sel_producto').hide();
									$('#btn_sel_producto').hide();
									if(idForm == 666){
										$('#lnkMsgExitoReturn').removeAttr("onclick");
										$('#div_contentMessage').html('Factura generada y guardada exitosamente.');
										$('#lnkMsgExitoReturn').one('click', function(){
											$(btn).removeAttr("disabled");
											irOpcion('principal');
										});
										
									} else {
										$('#lnkMsgExitoReturn').oen('click', function(){
											$(btn).removeAttr("disabled");
											irOpcion('productos');
										});
									}
									$(btn).removeAttr("disabled");
									irOpcion('msgExitos');
									//irOpcion('productos');
								}
							});
						});
					}
				}
			}//fin else
		}
		else {
			alert('Deben llenarse los campos marcados en ROJO.');
		}
		$(btn).removeAttr("disabled");
	}
}

function guardarClienteServer(obj) 
{
	app.creditea.verificarLogin(1);
	var db = app.webdb.db;
	db.transaction(function(tx){
		tx.executeSql("SELECT ID_CAP_CUSTOMER FROM CAP_CUSTOMER WHERE TYPE_IDENTITY = ? AND IDENTITY = ?",[obj.TYPE_IDENTITY, obj.IDENTITY],
		function(tx,results){
			var len = results.rows.length;
			if(len != 0)
			{
				idcli = results.rows.item(0);
				//actualizo
				var updateCap = "UPDATE CAP_CUSTOMER SET firstname=?,midname=?,lastname1=?,lastname2=?,gender=?,birthday=?,nationality=?,ocupation=?,education=?, patrimony=?, agencia=?, id_server=? WHERE ID_CAP_CUSTOMER = ?";
				tx.executeSql(updateCap,[obj.FIRSTNAME,obj.MIDNAME,obj.LASTNAME1,obj.LASTNAME2,obj.GENDER,obj.BIRTHDAY,obj.NATIONALITY,obj.OCUPATION,obj.EDUCATION,obj.PATRIMONY, obj.AGENCIA, obj.ID_SERVER, idcli.ID_CAP_CUSTOMER]);
			} else {
				//inserto
				var insCliente = "INSERT INTO cap_customer(id_cap_customer, firstname,midname,lastname1,lastname2,type_identity,identity,gender,birthday,status,nationality,ocupation,education,patrimony, active,date_created, agencia, id_server) ";
					insCliente += "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,strftime('%Y-%m-%d','now','localtime'),?, ?)";
				tx.executeSql(insCliente,[obj.ID, obj.FIRSTNAME,obj.MIDNAME,obj.LASTNAME1,obj.LASTNAME2,obj.TYPE_IDENTITY,obj.IDENTITY,obj.GENDER,obj.BIRTHDAY,obj.STATUS,obj.NATIONALITY,obj.OCUPATION,obj.EDUCATION,obj.PATRIMONY,1, obj.AGENCIA, obj.ID_SERVER]);
			}
		});
	});
}

function guardarFormularioServer(obj) 
{
	app.creditea.verificarLogin(1);
	var db = app.webdb.db;
	db.transaction(function(tx){
		//tx.executeSql("SELECT ID FROM STORAGE WHERE FORM = ? AND SUB_FORM=? AND CUSTOMER_REQUESTS = ?",[obj.FORM, obj.SUB_FORM, obj.CUSTOMER_REQUEST],
		//tx.executeSql("SELECT ID FROM STORAGE WHERE FORM = ? AND CUSTOMER_REQUESTS = ? AND ID_FORM_SERVER = ? ",[obj.FORM, obj.CUSTOMER_REQUEST, obj.ID_FORM_SERVER],
		tx.executeSql("SELECT ID FROM STORAGE WHERE FORM = ? AND CUSTOMER_REQUESTS = ? AND COD_SESS = ? ",[obj.FORM, obj.CUSTOMER_REQUEST, obj.COD_SESS],
		function(tx,results){
			var len = results.rows.length;
			if(len != 0)
			{
				idcli = results.rows.item(0);
				//actualizo
				var updateCap = "UPDATE STORAGE SET FORM_RESPONSE=?, FORM_PROD=?, ID_FORM_SERVER=?, ID_FORM_SERVER_R=? WHERE ID = ?";
				tx.executeSql(updateCap,[obj.FORM_RESPONSE,obj.FORM_PROD, obj.ID_FORM_SERVER, obj.ID_FORM_SERVER_R, idcli.ID]);
			} else {
				//inserto
				insert = "INSERT INTO STORAGE(FORM,SUB_FORM,FORM_PROD,FORM_RESPONSE,DATE_CREATED,ID_DIV, CUSTOMER_REQUESTS, ID_FORM_SERVER, ID_FORM_SERVER_R, COD_SESS) VALUES(?,?,?,?,strftime('%Y-%m-%d','now','localtime'),?,?,?,?,?)";
				tx.executeSql(insert,[obj.FORM,obj.SUB_FORM,obj.FORM_PROD,obj.FORM_RESPONSE,obj.ID_DIV,obj.CUSTOMER_REQUEST, obj.ID_FORM_SERVER, obj.ID_FORM_SERVER_R, obj.COD_SESS]);
			}
		});
	});
}

// Para la parte de paginacion
$( "#txt_findCliente" ).on( "keyup", function( e) {
	var input = $(this);	
	if(input.val() == ""){
		$('#ul_detalleCliente_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
		cargarListaCliente(0,0,50,1);
	} else {
		if(input.val().length > 2) {
			$('#ul_detalleCliente_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
			var db = app.webdb.db;
			var query = "SELECT ID_CAP_CUSTOMER, FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, NATIONALITY, IDENTITY FROM CAP_CUSTOMER WHERE (IDENTITY||\" \"||FIRSTNAME||\" \"||MIDNAME||\" \"||LASTNAME1||\" \"||LASTNAME2) LIKE '%"+input.val()+"%' ORDER BY LASTNAME1, LASTNAME2 LIMIT 100";
			var html = "";
			db.transaction(function(tx){
				tx.executeSql(query,[],function(tx,results){
					var len = results.rows.length;
					$('#ul_detalleCliente_list').html("");
					for(var i=0;i<len;i++){
						var row = results.rows.item(i);
						curr = i + 1;
						html = '<tr><td><img style="width:16px;height:16px;" src="images/ico-perfil.png" /></td><td>'+curr+'</td>';
						html += '<td style="width: 60px">'+row['ID_CAP_CUSTOMER']+'</td><td>'+row['FIRSTNAME'].toUpperCase()+' '+row['MIDNAME'].toUpperCase()+'</td><td>'+row['LASTNAME1'].toUpperCase()+' '+row['LASTNAME2'].toUpperCase()+'</td><td>'+row['IDENTITY']+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarClienteSesion('+row['ID_CAP_CUSTOMER']+');return false;"/></td></tr>';
						$('#ul_detalleCliente_list').append(html);
					}//fin for
					$("#fctnc").hide();
					$("#btnpagcli").closest('.ui-btn').hide();
				});
			}, app.webdb.onError);
		}
	}
});

$( "#txt_findCliente" ).on( "change", function( e) {
	var input = $(this);
	$('#ul_detalleCliente_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
	if(input.val() == ""){
		cargarListaCliente(0,0,50,1);
	} else {
		input.keyup();
	}
});

$( "#txt_fidu_findCliente" ).on( "keyup", function( e) {
	var input = $(this);	
	if(input.val() == ""){
		$('#ul_detalleElemento_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
		cargarListaGarantiasCliente('fiduciario',0,50,1);
	} else {
		if(input.val().length > 3) {
			$('#ul_detalleElemento_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
			var db = app.webdb.db;
			var query = "SELECT s.ID, ID_CAP_CUSTOMER, FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, NATIONALITY, IDENTITY, PATRIMONY FROM CAP_CUSTOMER c INNER JOIN STORAGE s ON c.ID_CAP_CUSTOMER=S.CUSTOMER_REQUESTS WHERE S.FORM=1 AND (IDENTITY||\" \"||FIRSTNAME||\" \"||MIDNAME||\" \"||LASTNAME1||\" \"||LASTNAME2) LIKE '%"+input.val()+"%' ORDER BY LASTNAME1, LASTNAME2 LIMIT 50";
			var html = "";
			db.transaction(function(tx){
				tx.executeSql(query,[],function(tx,results){
					var len = results.rows.length;
					$('#ul_detalleElemento_list').html("");
					for(var i=0;i<len;i++){
						var row = results.rows.item(i);
						//var info = $.parseJSON(row['FORM_RESPONSE']);
						curr = i + 1;
						/*html = '<tr><td><img style="width:16px;height:16px;" src="images/ico-perfil.png" /></td><td>'+curr+'</td>';
						html += '<td style="width: 60px">'+row['ID_CAP_CUSTOMER']+'</td><td>'+row['FIRSTNAME'].toUpperCase()+' '+row['MIDNAME'].toUpperCase()+'</td><td>'+row['LASTNAME1'].toUpperCase()+' '+row['LASTNAME2'].toUpperCase()+'</td><td>'+row['IDENTITY']+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 1);return false;"/></td></tr>'; */
						html  = '<tr>';
						html += '<td>'+row['ID']+'</td>';
						html += '<td>'+row['IDENTITY']+'</td>';
						html += '<td>'+row['FIRSTNAME'].toUpperCase()+' ';
						html += row['MIDNAME']==null?'</td>':row['MIDNAME'].toUpperCase()+'</td>';
						html += '<td>'+row['LASTNAME1'].toUpperCase()+' ';
						html += row['LASTNAME2']==null?'</td>':row['LASTNAME2'].toUpperCase() + '</td>';
						html += '<td>L. '+formatMoney(row['PATRIMONY'], 2)+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 1);return false;"/></td></tr>';
						$('#ul_detalleElemento_list').append(html);
					}//fin for
					$("#fctnc").hide();
					$("#btnpagcli").closest('.ui-btn').hide();
				});
			}, app.webdb.onError);
		}
	}
});

$( "#txt_fidu_findCliente" ).on( "change", function( e) {
	var input = $(this);
	$('#ul_detalleElemento_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
	if(input.val() == ""){
		cargarListaGarantiasCliente('fiduciario',0,50,1);
	} else {
		input.keyup();
	}
});
// Fin paginacion

function validarCredito() 
{
	if($("#editForm2").length){
		var d = $("#editForm2").val();
		if(d == "0"){
			alert("Para crear una garantia primero debe guardar la solicitud.");
			return false;
		}
		return true;
	} else {
		alert("Para crear una garantia primero debe guardar la solicitud.");
		return false;
	}
}

function quitarGarantia(idgar, idsol)
{
	var seguro = confirm('¿Esta seguro de eliminar esta garantía de esta solicitud?\n\rEsta acción no se podrá revertir');
	
	if(seguro) {
		var db = app.webdb.db;
		var query = "UPDATE GARANTIAS SET ELIMINADA = 1 WHERE ID_SOL = ? AND ID_GAR = ?";
		var html = "";
		db.transaction(function(tx){
			tx.executeSql(query,[idsol, idgar],function(tx,results){
				mostrarGarantias(idsol);
			});
		}, app.webdb.onError);
	}
}

function changeBackground() 
{
	var elDiv = $('.bg-login');
	var losFondos = new Array(); 
	losFondos[0] = 'bg-login-01.jpg'; 
	losFondos[1] = 'bg-login-02.jpg';
	losFondos[2] = 'bg-login-01.jpg';
	losFondos[3] = 'bg-login-02.jpg'; 

	var indice = Math.floor(Math.random() * losFondos.length);
	//alert(indice);
	
	if(typeof navigator.connection == 'undefined'){
		app_log("cargo fondo relativo");
		elDiv.css({'background-image':'url(images/' + losFondos[indice] + ')'});
	} else {
		app_log("cargo fondo android");
		elDiv.css({'background-image':'url(file:///android_asset/www/images/' + losFondos[indice] + ')'});
	}
}

function addingDynamicImage() 
{
	 var i = 0;
	bricklrOpts = [
		{
			target : '#target4',
			brickW : 100,
			brickH : 100,
			brickBg : '#87BA61',
			repeat : true
		},     
	];

	var intvl;
	intvl = setInterval(function () {
		i++;
		if (i >= bricklrOpts.length) {
			clearInterval(intvl);
			return;
		}
		bricklr(bricklrOpts[i]);
	}, 0);
	bricklr(bricklrOpts[0]);
}

function executeQuery(elem) {
	var db = app.webdb.db;
	var query = $(elem).parent().find('textarea').val().toUpperCase();
	if(query.substring(0,6) == 'SELECT'){
		$("#queryResult").append("<p>Realizando Consulta...</p>");
		$("#tableResult").show();
		$("#queryExecute").hide();
		var html = "";
		db.transaction(function(tx){
			if(query.indexOf("LIMIT") == -1){
				query += ' LIMIT 100';
			}
			tx.executeSql(query,[],function(tx,results){
				var len = results.rows.length;
				$("#queryResult").find('p').remove();
				if(len > 0){
					$("#resultHeader").empty();
					$("#resultBody").empty();
					//Armamos el Header
					var header = results.rows.item(0);
					var resHead = '<tr>';
					for (var th in header) {
						resHead += '<th>' + th +'</th>';
					}
					resHead += "</tr>";
					$("#resultHeader").append(resHead);
					//Armamos el cuerpo
					for(var i=0;i<len;i++){
						var row = results.rows.item(i);
						html  = '<tr>';
						for (var td in row) {
							html += '<td>' + row[td] + '</td>';
						}
						html  += '</tr>';
						$('#resultBody').append(html);
					}
				} else {
					$("#resultHeader").empty();
					$("#resultBody").empty();
					$("#resultHeader").append("<tr><th>Resultado</td></tr>");
					$("#resultBody").append("<tr><td style='text-align:center;'>No se Encontraron Resultados con su consulta</td></tr>");
				}
			});
		}, app.webdb.onError);
	} else if(query.substring(0,6) == 'DELETE' || query.substring(0,4) == 'DROP'){
		var seguro = confirm('Esta seguro de ejecutar esta sentencia?\n\rUna ves ejecutado esto no se podra revertir.');
		if(seguro){
			db.transaction(function(tx){
				//Eliminamos los datos
				tx.executeSql(query,[]);
			});
		}
	} else if(query.substring(0,6) == 'UPDATE' || query.substring(0,6) == 'INSERT'){
		//alert('Operacion pendiente de realizar');
		db.transaction(function(tx){
				//insertamos o actualizamos los datos
				tx.executeSql(query,[]);
		});
	} else {
		alert('Operacion pendiente de realizar');
	}
}

// para controlar mejor la fecha
Number.prototype.double = function ()
{
        var nm = String(this);
        return (nm == '0') ? nm : (nm.length < 2) ? '0' + nm : nm;
};
 
function agregarCero(num)
{
        var nm = String(num);
        return (nm.length < 2) ? '0' + nm : nm;
}

function xDateTime (cnf)
{
        if (!cnf) cnf = { date: new Date()};
 
        var dte = cnf.date;
        var dteD = dte.getDate(), dteM = dte.getMonth() + 1, dteY = dte.getFullYear();
        var tme = dte.getTime();
		dte.setTime(parseInt(tme + parseInt((cnf.hours ? cnf.hours : 0) * 60 * 60 * 1000)));
 
        dteD = agregarCero(dte.getDate()); dteM = agregarCero(dte.getMonth() + 1); dteY = dte.getFullYear();
 
        var tmeH = agregarCero(dte.getHours()); 
		var tmeM = agregarCero(dte.getMinutes());
		var	tmeS = agregarCero(dte.getSeconds());
 
        //var rtn = '', rtnD = dteD + '/' + dteM + '/' + dteY, rtnT = tmeH + ':' + tmeM + ':' + tmeS + (dte.getHours() >= 12 ? 'PM' : 'AM');
		  var rtn = '', rtnD = dteY + '-' + dteM + '-' + dteD, rtnT = tmeH + ':' + tmeM + ':' + tmeS;
        switch (cnf.type)
        {
        	case 'd':
        		rtn = rtnD;
        		break;
        	case 't':
        		rtn = rtnT;
        		break;
        	case 'dt':
        		rtn = rtnD + ' ' + rtnT;
        		break;
        	case 'td':
        		rtn = rtnT + ' ' + rtnD;
        		break;
        	default:
        		rtn = rtnD + ' ' + rtnT;
        };
        return rtn;
}