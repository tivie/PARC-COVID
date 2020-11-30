/*
 *     PARC-COVID: Plataforma Automática de Rastreio de Contactos
 *     Copyright (C) 2020 - 2020 Estêvão Soares dos Santos
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     You are forbidden, however, to remove ANY COPYRIGHT NOTICE FROM BOTH THE
 *     LICENSE FILE OR SOURCE CODE, either visible or invisible to the public.
 *     
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// todo passar isto para dentro do document ready e mudar para jquery
/**
 * 
 * @param {event} ev
 * @returns {boolean}
 */
function submitForm(ev) {

  var form = $('#formulario-caso-positivo');
  var arrayData = form.serializeArray();
  var contactos;
  var payload = {};
  var params = getParams();
  var button = document.getElementById('enviarform');

  addLoadingStatus(button);
  
  if (!form[0].checkValidity()) {
    removeLoadingStatus(button);
    return false;
  }
  
  // Obter hash do endereço e adicionar ao payload
  payload.casehash = params.get('guid');
  payload.contactos = [];
  contactos = arrayData.filter(function(f) { return f.name.match(/^contacto_/); });

  // temos de adicionar os switches (boleanos) primeiro
  payload.profissional_de_lar = false;
  payload.profissional_de_saude = false;
  
  arrayData.forEach(function(item) {
    // adicionar cada uns dos fields referentes ao paciente
    if (!item.name.match(/^contacto_/)) {
      var val;
      // transformar num utente em inteiro
      switch(item.name) {
        
        case 'num_utente':
          val = parseInt(item.value);
          break;
          
        case 'sexo':
          val = item.value === 'masculino' ? 0 : 1;
          break;
          
        case 'profissional_de_lar':
        case 'profissional_de_saude':
          val = item.value === 'on';
          break;
        default:
          val = item.value;
      }
      payload[item.name] = val;
    }
  });

  ev.preventDefault();
  
  for (var i = 0; i < contactos.length; i = i + 4) {
    if (contactos[i].value && contactos[i + 1].value) {
      // apenas processa info se tiver nome e contacto telefonico
      var contact = {
        c_nome: contactos[i].value,
        c_tel: contactos[i + 1].value,
        c_email: contactos[i + 2].value,
        c_data_contacto: contactos[i + 3].value
      }
      payload.contactos.push(contact);
    }
  }

  if (config.debug) {
    console.log(JSON.stringify(payload));
    removeLoadingStatus(button);
    return false;
  }

  var url = config.form1.url;

  var rqt = $.ajax({
    url: url,
    type: "POST",
    crossDomain: true,
    data: JSON.stringify(payload),
    dataType: "json",
    headers: {
      'Content-Type': 'application/json'
    }
  });

  rqt.done(function () {
    // dar feedback ao utente
    removeLoadingStatus(button);
    window.location.href = '../responses/sucesso.html';
  });

  rqt.fail(function (xhr) {
    removeLoadingStatus(button);
    alert(xhr.responseJSON.error.message);
  });
}
