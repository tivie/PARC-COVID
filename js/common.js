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

function encodeEmailAddress(mail) {
  'use strict';
  var encode = [
    function (ch) {
      return '&#' + ch.charCodeAt(0) + ';';
    },
    function (ch) {
      return '&#x' + ch.charCodeAt(0).toString(16) + ';';
    },
    function (ch) {
      return ch;
    }
  ];

  mail = mail.replace(/./g, function (ch) {
    if (ch === '@') {
      // this *must* be encoded. I insist.
      ch = encode[Math.floor(Math.random() * 2)](ch);
    } else {
      var r = Math.random();
      // roughly 10% raw, 45% hex, 45% dec
      ch = (
        r > 0.9 ? encode[2](ch) : r > 0.45 ? encode[1](ch) : encode[0](ch)
      );
    }
    return ch;
  });
  return mail;
}

(function() {
  'use strict';
  var mmm = document.getElementsByClassName('mmm');
  for (var i = 0; i < mmm.length; ++i) {
    mmm[i].innerHTML = '<a href="mailto:' + encodeEmailAddress(config.email) +'">' + encodeEmailAddress(config.email) +'</a>';
  }
})();

function addLoadingStatus(ev) {
  ev.currentTarget.disabled = true;
  ev.currentTarget.children[0].classList.remove("d-none");
}

function removeLoadingStatus(ev) {
  ev.currentTarget.disabled = false;
  ev.currentTarget.children[0].classList.add("d-none");
}

function removeContact(ev) {
  ev.currentTarget.parentElement.parentElement.remove();
}

/**
 * 
 * @returns {URLSearchParams}
 */
function getParams() {
  var urlStr = window.location.href.replace(/\?.*#/g,"?");
  urlStr = urlStr.replace(/#/g, "?");
  var myUrl = new URL(urlStr);
  return new URLSearchParams(myUrl.search);
}

/**
 * 
 * @param {jQuery} $wrapper
 * @param {boolean} [makeRequired=true]
 */
function switchActivate($wrapper, makeRequired) {
  makeRequired = !!makeRequired || true;
  var input = $wrapper.find('input');
  var select = $wrapper.find('select');
  $wrapper.toggle();

  if (!makeRequired) return;
  
  if ($wrapper.is(":visible")) {
    input.attr('required', true);
  } else {
    input.attr('required', false);
    select.prop('selectedIndex',0);
    if (input.attr('type') === 'checkbox') {
      input.prop('checked',false);
    } else {
      input.val('');
    }
  }
}

/**
 *
 * @param {HTMLInputElement} input
 */
function validateDate(input) {
  var idate = input.value;
  
  if (idate instanceof Date) {
    //return true;
  } else if (typeof idate === 'string') {
    if (idate === "") {
      return true
    }

    // check if it matches ####-##-## format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(idate)) {
      input.setCustomValidity("A data tem de estar no formato yyyy-mm-dd");
      return false;
    }
    idate = idate.split(idate).map(parseInt);
    if (idate[0] < 1900 || idate[0] > 2100) {
      input.setCustomValidity("O ano tem de ser superior a 1900 e inferior a 2100");
      return false;
    }

    if (idate[1] < 1 || idate[1] > 12) {
      input.setCustomValidity("O mês especificado " + idate[1] + " não existe");
      return false;
    }

    if (idate[2] < 1 || idate[2] > 31) {
      input.setCustomValidity("O dia especificado " + idate[2] + " não existe");
      return false;
    }

    switch (idate[1]) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        if (idate[2] > 31) {
          input.setCustomValidity("O mês " + idate[1] + " tem, no máximo, 31 dias");
          return false;
        }
        break;
      case 4:
      case 6:
      case 9:
      case 11:
        if (idate[2] > 30) {
          input.setCustomValidity("O mês " + idate[1] + " tem, no máximo, 30 dias");
          return false;
        }
        break;
      case 2:
        if (idate[2] > 29) {
          input.setCustomValidity("O mês " + idate[1] + " tem, no máximo, 29 dias");
          return false;
        }
        break;
    }
  }
  input.setCustomValidity("");
  return true;
}

$(document).ready(function () {
  $('#adicionar-contacto').click(function () {
    $('#cena-para-add .rastreio-de-contactos-row')
      .first()
      .clone()
      .appendTo('#rastreio-de-contactos-items');
  });

  // Ativar/desativar dados profissionais se a pessoa estiver empregada/desempregada
  $('#situacao-perante-emprego').change(function() {
    var items = $('.form-dados-prof-item');

    if (this.value !== 'empregado') {
      $('#profissao').val(this.value);
      items.hide();
    } else {
      $('#profissao').val('');
      items.show();
    }

    if (items.is(":visible")) {
      items.children('input').each(function() {
        var item = $(this);
        if (!item.is(':checkbox')) {
          item.prop('required', true);
        }
      });
    } else {
      items.children('input').prop('required', false);
    }
  });

  $('#concelho-select').change(function() {

    var wrapper = $('#concelho-wrapper');
    var input = $('#concelho');
    var freg = $('#freguesia');
    var fregSelect = $('#freguesia-select');
    var selectedConcelho = this.value;

    $('#freguesia-wrapper').show();

    fregSelect.find("option").hide();
    
    if (selectedConcelho === 'outro') {
      input.val('');
      freg.val('');
      freg.show();
      fregSelect.hide();
      wrapper.show();
    } else {
      input.val(this.value);
      freg.hide();
      wrapper.hide();

      fregSelect.find("option")
        .filter(function() {
          return $(this).data('concelho') === selectedConcelho}
        )
        .show();
      
      fregSelect.prop('selectedIndex',0);
      //fregSelect.prop('required', true);
      fregSelect.show();
    }

    if (input.is(":visible")) {
      input.prop('required', true);
    } else {
      input.prop('required', false);
    }
    
  });
  
  $('#freguesia-select').change(function() {
    $('#freguesia').val(this.value);
  })
  
  $('#profissional_de_lar').click(function() {
    switchActivate($('#nome-do-lar-wrapper'));
  });

  $('#profissional_de_saude').click(function() {
    switchActivate($('#instituicao-de-saude-wrapper'));
  });
});


