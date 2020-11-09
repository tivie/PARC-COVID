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
(function() {
  'use strict';
  var mmm = document.getElementsByClassName('mmm');
  for (var i = 0; i < mmm.length; ++i) {
    mmm[i].innerHTML = '<a href="mailto:' + encodeEmailAddress(config.email) +'">' + encodeEmailAddress(config.email) +'</a>';
  }
})();

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

  console.log(mail);
  
  return mail;
}

function addLoadingStatus(ev) {
  ev.currentTarget.disabled = true;
  ev.currentTarget.children[0].classList.remove("d-none");
}
