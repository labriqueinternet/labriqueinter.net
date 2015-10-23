/* VPN Client app for YunoHost 
 * Copyright (C) 2015 Julien Vaubourg <julien@vaubourg.com>
 * Contribute at https://github.com/labriqueinternet/vpnclient_ynh
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function tabsClick() {
  var tab = $(this).parent().attr('data-tab');

  $('.nav').find('li.active').removeClass('active');
  $(this).parent().addClass('active');

  $('.tabs').hide();
  $('.tab' + tab).show();

  return false;
}

var crtFilesContent = {
  index: 0,
  crt_server_ca: '',
  crt_client: '',
  crt_client_key: '',
  crt_client_ta: ''
}

var cubeJson;

function formatCrtFileContent(txt) {
  txt = txt.replace(/\n/g, '|');
  txt = txt.replace(/^.*\|(-.*-\|.*\|-.*-)\|.*$/, '$1');

  return txt;
}

function generateCubeJson() {


  if(crtFilesContent.index < 4) {
    return false;
  }

  var cube = {
    server_name: $('#server_name').val(),
    server_port: $('#server_port').val(),
    server_proto: $('#server_proto').val(),
    ip6_net: $('#ip6_net').val(),
    crt_server_ca: crtFilesContent.crt_server_ca,
    crt_client: crtFilesContent.crt_client,
    crt_client_key: crtFilesContent.crt_client_key,
    crt_client_ta: crtFilesContent.crt_client_ta,
    login_user: $('#login_user').val(),
    login_passphrase: $('#login_passphrase').val(),
    dns0: $('#dns0').val(),
    dns1: $('#dns1').val()
  }

  var json = JSON.stringify(cube, null, 2);

  proposeCubeFileDownload(json);
}

function readCrtFileContent(id) {
  var crtFiles = $('#' + id).prop('files');

  if(crtFiles.length > 0) {
    var fileReader = new FileReader();
    fileReader.readAsText(crtFiles[0]);

    fileReader.onload = function(e) {
      var fileContent = e.target.result;
      crtFileContent = formatCrtFileContent(fileContent);
      crtFilesContent[id] = crtFileContent;
      crtFilesContent.index++;

      generateCubeJson();
    };

    return true;
  }

  crtFilesContent.index++;

  return false;
}

function validate() {
  var crtFilesToRead = 0;

  readCrtFileContent('crt_server_ca') && crtFilesToRead++;
  readCrtFileContent('crt_client') && crtFilesToRead++;
  readCrtFileContent('crt_client_key') && crtFilesToRead++;
  readCrtFileContent('crt_client_ta') && crtFilesToRead++;

  if(crtFilesToRead == 0) {
    generateCubeJson();
  }

  return false;
}

function proposeCubeFileDownload(json) {
  var fileContent = window.btoa(json);
  fileContent = "data:application/octet-stream;base64," + fileContent;

  var downloadLink = $('<a>',{
    text: 'config.cube',
    download: 'config.cube',
    href: fileContent
  });

  downloadLink.appendTo('body');
}

function i18n() {
  $('[data-title]').each(function() {
    $(this).data('title', $(this).data('title').replace("_('", '').replace("')", ''));
  });

  $('h1, h2, h3, label, a, strong, em, button').each(function() {
    $(this).text($(this).text().replace('_("', '').replace('")', ''));
  });
}

$(document).ready(function() {
  i18n();

  $('.btn-group').button();
  $('[data-toggle="tooltip"]').tooltip();

  $('.switch').bootstrapToggle();
  $('.nav-tabs a').click(tabsClick);

  $('.fileinput').click(function() {
    if(!$(this).hasClass('btn-danger')) {
      var realinputid = '#' + $(this).attr('id').replace(/_chooser.*/, '');

      $(realinputid).click();
    }
  });

  $('.deletefile').click(function() {
    var chooserbtnid = '#' + $(this).attr('id').replace(/_deletebtn$/, '_chooserbtn');
    var choosertxtid = '#' + $(this).attr('id').replace(/_deletebtn$/, '_choosertxt');
    var fileinputid = '#' + $(this).attr('id').replace(/_deletebtn$/, '');
    var deleteinputid = '#' + $(this).attr('id').replace(/btn$/, '');

    $(deleteinputid).click();
    $(chooserbtnid).toggleClass('btn-danger');
    $(chooserbtnid).toggleClass('not-allowed');
    $(choosertxtid).toggleClass('btn-danger');
    $(choosertxtid).val($(choosertxtid).hasClass('btn-danger') ? 'Removal requested' : '');
    $(fileinputid).val('');

    if($(this).attr('id').search('_key') >= 0) {
      if($(choosertxtid).hasClass('btn-danger') != $('#crt_client_choosertxt').hasClass('btn-danger')) {
        $('#crt_client_deletebtn').click();
      }
    } else if($(this).attr('id').search('_ta') < 0) {
      if($(choosertxtid).hasClass('btn-danger') != $('#crt_client_key_choosertxt').hasClass('btn-danger')) {
        $('#crt_client_key_deletebtn').click();
      }
    }
  });

  $('input[type="file"]').change(function() {
    var choosertxtid = '#' + $(this).attr('id') + '_choosertxt';

    $(choosertxtid).val($(this).val().replace(/^.*[\/\\]/, ''));
  });

  $('#save').click(function() {
    $(this).prop('disabled', true);
    $('#save-loading').show();
  });

  $('#status .close').click(function() {
    $(this).parent().hide();
  });

  $('#statusbtn').click(function() {
    if($('#status-loading').is(':hidden')) {
      $('#status').hide();
      $('#status-loading').show();

      $.ajax({
        url: '?/status',
      }).done(function(data) {
        $('#status-loading').hide();
        $('#status-text').html('<ul>' + data + '</ul>');
        $('#status').show('slow');
      });
    }
  });

  $('#raw_openvpn_btn').click(function() {
    $('#raw_openvpn_btnpanel').hide();
    $('#raw_openvpn_panel').show('low');
  });

  $('#service_enabled').change(function() {
    if($('#service_enabled').parent().hasClass('off')) {
      $('.enabled').hide('slow');
    } else {
      $('.enabled').show('slow');
    }
  });
});
