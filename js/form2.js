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

var schema;

$(document).ready(function() {

  $.getJSON("../schemas/form2.schema.json")
    .done(function(json) {
      schema = json;
    });
  
  var case_guid = getParams().get('case_guid');
  var contact_guid = getParams().get('contact_guid');
  var cpn = getParams().get('cpn');
  var id = getParams().get('id');
  if (!case_guid || !contact_guid || !cpn || !id) {
    $('#enviarform').prop('disabled', true);
  }
  $('.caso_pos_name').text(cpn);
  
  $('#fez_teste').click(function() {
    switchActivate($('#fez-teste-wrapper'));
  });
  
  $('#tem_doenca_cronica').click(function () {
    var $wrapper = $('#doenca-cronica-wrapper');
    $wrapper.toggle();
    
    if ($wrapper.is(":hidden")) {
      $wrapper.find('input').each( function() {
        if ($(this).attr('type')  === 'checkbox') {
          $(this).prop('checked',false);
        } else {
          $(this).val('')
        }
      });
    }
  });

  $('#tem_sintomas').click(function () {
    var $wrapper = $('#sintomas-wrapper');
    var dataInput = $('#data_de_inicio_de_sintomas');
    $wrapper.toggle();
    
    if ($wrapper.is(":visible")) {
      dataInput.attr('required', true);
    } else {
      dataInput.attr('required', false);
      
      $wrapper.find('input').each( function() {
        if ($(this).attr('type')  === 'checkbox') {
          $(this).prop('checked',false);
        } else {
          $(this).val('')
        }
      });
    }
  });
  
  
  
});

function validateCheckBoxGroup($wrapper) {
  var ipt = $wrapper.find('input[type=checkbox]')[0];
  if ($wrapper.is(":visible")) {
    var checked = $wrapper.find('input[type=checkbox]:checked').length;
    if (!checked) {
      ipt.setCustomValidity("Pelo menos um dos campos tem de ser assinalado");
    } else {
      ipt.setCustomValidity("");
    }
  } else {
    ipt.setCustomValidity("");
  }
}

function submitForm(ev) {
  var form = $('#formulario-contacto');
  var case_guid = getParams().get('case_guid');
  var contact_guid = getParams().get('contact_guid');
  var id = getParams().get('id');
  
  addLoadingStatus(ev);
  
  // run custom validity
  validateCheckBoxGroup($('#sintomas-wrapper'));
  validateCheckBoxGroup($('#doenca-cronica-wrapper'));
  
  $(form).find('input[data-type="date"]').each(function() {
    validateDate(this);
  });

  if (!form[0].checkValidity()) {
    removeLoadingStatus(ev);
    return false;
  }
  
  var arrayData = form.serializeArray();
  var payload = {};

  // Obter guids e ids do endereço e adicionar ao payload
  payload.id = parseInt(id);
  payload.case_guid = case_guid;
  payload.contact_guid = contact_guid;
  
  // temos de adicionar todos os switches (checkboxes) primeiro e meter a falso
  form.find('input[type=checkbox]').each(function() {
    var key = $(this).attr('name');
    payload[key] = false;
  });
  
  arrayData.forEach(function(item) {
    var p;
    // adicionar cada uns dos fields referentes ao paciente
    if (!item.name.match(/^contacto_/)) {
      var val = item.value;
      if (val === 'on') {
        val = true;
      } else if (val === 'off') {
        val = false;
      }
      
      // transformar num utente em inteiro
      switch(item.name) {

        case 'data_do_exame':
        case 'data_de_inicio_de_sintomas':
          val = (item.value === "" || item.value === null) ? null : item.value;
          break;
        case 'resultado_exame':
            val = (item.value === "" || item.value === null) ? null : parseInt(item.value);
          break;
        case 'num_utente':
        case 'cpostal4':
          val = parseInt(item.value);
          break;
        case 'sexo':
          val = item.value === 'masculino' ? 0 : 1;
          break;
          
        case 'nome_do_lar':
        case 'instituicao_de_saude':
          val = (item.value === "" || item.value === null) ? null : item.value;
          break;
      }
      payload[item.name] = val;
    }
  });
  
  // temos as propriedades não obrigatorias, para o flows não reclamar, vamos remove-las
  if (payload.fez_teste === false) {
    delete payload.data_do_exame;
    delete payload.resultado_exame;
  }
  if (payload.tem_sintomas === false) {
    delete payload.data_de_inicio_de_sintomas;
  }

  // last validation (against Schema)
  //var ajv = new Ajv();
  //var validate = ajv.compile(schema);
  //var valid = validate(payload);
  //if (!valid) {
  //  console.log(validate.errors);
  //}

  //if (!form[0].checkValidity()) {
  //  removeLoadingStatus(ev);
  //  return false;
  //}

  ev.preventDefault();
  
  if (config.debug) {
    console.log(JSON.stringify(payload));
    removeLoadingStatus(ev);
    return false;
  }

  var url = config.form2.url;

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

  rqt.done(function (response) {
    // dar feedback ao utente
    window.location.href = '../responses/sucesso.html';
  });

  rqt.fail(function (xhr, status) {
    removeLoadingStatus(ev);
    alert(xhr.responseJSON.error.message);
  });
}
