var _CUANTOS = 0;

function str_replace(busca, repla, orig) {
	str 	= new String(orig);
	rExp	= "/"+busca+"/g";
	rExp	= eval(rExp);
	newS	= String(repla);
	str = new String(str.replace(rExp, newS));

	return str;
}

function getUrl( nombre )
{
  nombre = nombre.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+nombre+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function limpiar(cual) {
	//cual = cual.replace(/+/," ");
	//cual = cual.replace("%E1","á").replace("%F1","ñ").replace("%E9","é").replace("%ED","í").replace("%F3","ó").replace("%FA","ú");
	return cual;
}

function cargarPrevs() {
    document.getElementById('divCargando').style.display = 'none';
    
    //por ahora se deshabilita la busqueda en paginas diferentes a la principal
    return;
    
	var cual = getUrl('tfAnho');
	if (cual != "") {		
		document.getElementById('tfAnho').value = limpiar(cual);
		consultarAnio ();
	}
	else {
		cual = getUrl('tfAutor');
		if (cual != "") {		
			document.getElementById('tfAutor').value = limpiar(cual);
			consultarAutor ();
		}
		else {
			cual = getUrl('tfTecnica');
			if (cual != "") {		
				document.getElementById('tfTecnica').value = limpiar(cual);
				consultarTecnica ();
			}
			else {
				cual = getUrl('sTematica');
				if (cual != "") {		
					consultarTematica (limpiar(cual));
				}
				else {
					cual = getUrl('consulta33');
					if (cual != "") {		
						window.location = "tecnicas.html";
					}
					else {
						consultarTematica ("");
					}
				}
			}
		}
	}
}


function concultarTodas() {
	var obj = document.getElementById('rbTodasList');
	
	if (obj.checked) {
		window.location = "lista_todas.html";
	}
	else {
		window.location = "prev_todas.html";
	}
}

function verTecnicas () {
	document.getElementById('divGaleria').style.display = 'none';
	document.getElementById('divTecnicas').style.display = '';
	establecerTitulo ("Listado alfabético");
}

function ocultarTecnicas () {
	document.getElementById('divGaleria').style.display = '';
	document.getElementById('divTecnicas').style.display = 'none';
	establecerTitulo ("Todos");
}

function consultarTecnica () {
	var obj = document.getElementById('tfTecnica');
	
    _CUANTOS = 0;
	for (var i = 1; i <= _NUM_GRABADOS; i++) {
		var cual = document.getElementById('prev_' + _GRABADOS[i][0]);
		if (cual) {
			if (_GRABADOS[i][3].toLowerCase().indexOf(obj.value.toLowerCase()) != -1) {
                _CUANTOS++;
				cual.style.display = 'inline-table';
			}
			else {
				cual.style.display = 'none';
			}
		}
	}
    
	ocultarTecnicas ();
    establecerTitulo ("Técnica: " + obj.value);
}

function consultarAutor () {
	var obj = document.getElementById('tfAutor');
	
    _CUANTOS = 0;
	for (var i = 1; i <= _NUM_GRABADOS; i++) {
		var cual = document.getElementById('prev_' + _GRABADOS[i][0]);
		if (cual) {
			if (_GRABADOS[i][1].toLowerCase().indexOf(obj.value.toLowerCase()) != -1) {
                _CUANTOS++;
				cual.style.display = 'inline-table';
			}
			else {
				cual.style.display = 'none';
			}
		}
	}
    
	ocultarTecnicas ();
    establecerTitulo ("Autor: " + obj.value);
}

function consultarTematica (cual) {
	var que;
	if (cual) {
		que = cual;
	}
	else {
		que = document.getElementById('sTematica').value;
	}
	
	que = str_replace('_', ' ', que);
	
    _CUANTOS = 0;
	for (var i = 1; i <= _NUM_GRABADOS; i++) {
		var cual = document.getElementById('prev_' + _GRABADOS[i][0]);
		if (cual) {
			if (_GRABADOS[i][2].indexOf(que) != -1) {
                _CUANTOS++;
				cual.style.display = 'inline-table';
			}
			else {
				cual.style.display = 'none';
			}
		}
	}
    
	ocultarTecnicas ();
    establecerTitulo ("Temática: " + que);
}

function consultarAnio () {
	var obj = document.getElementById('tfAnho');
	
    _CUANTOS = 0;
	for (var i = 1; i <= _NUM_GRABADOS; i++) {
		var cual = document.getElementById('prev_' + _GRABADOS[i][0]);
		if (cual) {
			if (_GRABADOS[i][0].substring(0,2) == obj.value.substr(-2,2)) {
                _CUANTOS++;
				cual.style.display = 'inline-table';
			}
			else {
				cual.style.display = 'none';
			}
		}
	}
	ocultarTecnicas ();
    establecerTitulo ("Año: " + obj.value);
}

function establecerTitulo (texto) {
    document.getElementById("divConsulta").innerHTML = texto + "<br /> [" + _CUANTOS + " resultados]";
}