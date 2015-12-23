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


/**************
 *** MODELS ***
 **************/

var cube = {
  crtFilesContent: {
    index: 0,
    read: false,
    crt_server_ca: '',
    crt_client: '',
    crt_client_key: '',
    crt_client_ta: ''
  },

  readCrtFiles: function() {
    var filesToRead = [
      'crt_server_ca',
      'crt_client',
      'crt_client_key',
      'crt_client_ta'
    ];

    cube.crtFilesContent.read = true;
  
    $.each(filesToRead, function(i, fileName) {
      cube.readCrtFileContent(fileName);
    });
  },

  readCrtFileContent: function(id) {
    var crtFiles = $('#vpn_' + id).prop('files');

    if(crtFiles.length > 0) {
      var fileReader = new FileReader();
      fileReader.readAsText(crtFiles[0]);
  
      fileReader.onload = function(e) {
        var fileContent = e.target.result;
        var crtFileContent = cube.formatCrtFileContent(fileContent);

        cube.crtFilesContent[id] = crtFileContent;
        cube.crtFilesContent.index++;
      };
  
      return true;
    }
  
    cube.crtFilesContent.index++;
  
    return false;
  },

  formatCrtFileContent: function (txt) {
    txt = txt.replace(/\n/g, '|');
    txt = txt.replace(/^.*\|(-.*-\|.*\|-.*-)\|.*$/, '$1');
  
    return txt;
  },

  hasConfigToUpload: function() {
    var cubeFiles = $('#vpn_cubefile').prop('files');

    if(cubeFiles.length > 0) {
      
    }
  },

  toJson: function(callback, callbackArg1) {
    var stalker = function() {
      if(cube.crtFilesContent.index < 4) {
        setTimeout(stalker, 100);
      } else {
        cube.doToJson(callback, callbackArg1);
      }
    };

    if(!cube.crtFilesContent.read) {
      cube.readCrtFiles();
    }

    stalker();
  },

  doToJson: function(callback, callbackArg1) {
    if(cube.crtFilesContent.index < 4) {
      return false;
    }

    var json = {
      server_name: $('#vpn_server_name').val(),
      server_port: $('#vpn_server_port').val(),
      server_proto: $('input[name=vpn_server_proto]:checked').val(),
      ip6_net: $('#vpn_ip6_net').val(),
      crt_server_ca: cube.crtFilesContent.crt_server_ca,
      crt_client: cube.crtFilesContent.crt_client,
      crt_client_key: cube.crtFilesContent.crt_client_key,
      crt_client_ta: cube.crtFilesContent.crt_client_ta,
      login_user: $('#vpn_login_user').val(),
      login_passphrase: $('#vpn_login_passphrase').val(),
      dns0: $('#vpn_dns0').val(),
      dns1: $('#vpn_dns1').val(),
      openvpn_rm: $('#vpn_openvpn_rm').val().split("\n"),
      openvpn_add: $('#vpn_openvpn_add').val().split("\n")
    };

    callback(json, callbackArg1);
  },

  toJsonTxt: function(json) {
    return JSON.stringify(json, null, 2);
  },

  proposeDownload: function(json) {
    var fileContent = window.btoa(cube.toJsonTxt(json));
    fileContent = "data:application/octet-stream;base64," + fileContent;
  
    var downloadLink = $('<a>',{
      text: 'config.cube',
      download: 'config.cube',
      href: fileContent
    });
  
    downloadLink.appendTo('body');
  }
}

var hypercube = {
  toJson: function(callback) {
    cube.toJson(hypercube.doToJson, callback);
  },

  doToJson: function(cubeJson, callback) {
    var json = {
      vpnclient: cubeJson,

      hotspot: {
        wifi_ssid: $('#hotspot_wifi_ssid').val(),
        wifi_passphrase: $('#hotspot_wifi_passphrase').val(),
        ip6_net: $('#hotspot_ip6_net').val(),
        ip6_dns0: $('#hotspot_ip6_dns0').val(),
        ip6_dns1: $('#hotspot_ip6_dns1').val(),
        ip4_dns0: $('#hotspot_ip4_dns0').val(),
        ip4_dns1: $('#hotspot_ip4_dns1').val(),
        ip4_nat_prefix: $('#hotspot_ip4_nat_prefix').val(),
        firmware_nonfree: $('#hotspot_firmware_nonfree').is(':checked') ? 'yes' : 'no'
      },

      yunohost: {
        domain: $('#ynh_domain').val(),
        add_domain: $('#ynh_add_domain').val(),
        password: $('#ynh_password').val(),
        user: $('#ynh_user').val(),
        user_firstname: $('#ynh_user_firstname').val(),
        user_lastname: $('#ynh_user_lastname').val(),
        user_password: $('#ynh_user_password').val()
      }
    };

    callback(json);
  },

  toJsonTxt: function(json) {
    return JSON.stringify(json, null, 2);
  },

  proposeDownload: function(json) {
    var fileContent = window.btoa(hypercube.toJsonTxt(json));
    fileContent = "data:application/octet-stream;base64," + fileContent;
  
    var downloadLink = $('<a>',{
      text: 'install.hypercube',
      download: 'install.hypercube',
      href: fileContent
    });
  
    downloadLink.appendTo('body');
  }
}


/************/
/*** VIEW ***/
/************/

var view = {
  showPanel: function(panel) {
    $('.panel').hide();
    $('#panel-' + panel).show();
  },
  
  showQuestion: function(question) {
    $('.question').hide();
    $('#question-' + question).show();
  },
  
  showButtonNext: function(nextStep) {
    $('#button-next').data('nextpanel', nextStep);
    $('#button-submit').hide();
    $('#button-next').show();
  },
  
  showButtonSubmit: function() {
    $('#button-next').hide();
    $('#button-submit').show();
  },

  i18n: function() {
    $('[data-title]').each(function() {
      $(this).data('title', $(this).data('title').replace("_('", '').replace("')", ''));
    });
  
    $('h1, h2, h3, h4, label, a, strong, em, button, .i18n').each(function() {
      if($(this).children().length == 0) {
        $(this).text($(this).text().replace('_("', '').replace('")', ''));
      }
    });
  },

  setEvents: function() {
    view.i18n();

    $('.btn-group').button();
    $('[data-toggle="tooltip"]').tooltip();
    $('.switch').bootstrapToggle();

    $('.nav-tabs a').click(navigation.tabClick);
    $('.nav-pills a').click(navigation.questionClick);
    $('.fileinput').click(controller.fileInputClick);
    $('.deletefile').click(controller.deleteFileButtonClick);
    $('input[type="file"]').change(controller.fileInputChange);
    $('#button-next').click(controller.nextButtonClick);
    $('#button-submit').click(controller.submitButtonClick);

    $('#vpn_auth_type').find('input').change(controller.authtypeChbxChange);
  }
}


/*******************/
/*** CONTROLLERS ***/
/*******************/

var controller = {
  authtypeChbxChange: function() {
    var name = $(this).prop('name');
  
    if($(this).prop('checked')) {
      $('#' + name).show();
    } else {
      $('#' + name).hide();
    }
  },

  fileInputClick: function() {
    if(!$(this).hasClass('btn-danger')) {
      var realinputid = '#' + $(this).attr('id').replace(/_chooser.*/, '');
      $(realinputid).click();
    }
  },

  deleteFileButtonClick: function() {
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
  },

  fileInputChange: function() {
    var choosertxtid = '#' + $(this).attr('id') + '_choosertxt';
    $(choosertxtid).val($(this).val().replace(/^.*[\/\\]/, ''));
  },

  nextButtonClick: function() {
    var nextStep = $(this).data('nextpanel');

    view.showPanel(nextStep);

    if(nextStep == 'lbi') {
      view.showButtonSubmit();
    }
  },

  submitButtonClick: function() {
    controller.formSubmit();
  },

  formSubmit: function() {
    cube.toJson(cube.proposeDownload);
    hypercube.toJson(hypercube.proposeDownload);

    return false;
  } 
}

var navigation = {
  tabClick: function () {
    var active = $(this).parent().attr('data-tab');
  
    $(this).parents('.nav').find('li.active').removeClass('active');
    $(this).parent().addClass('active');
    $(this).parents('.panel').find('.tab').hide();
    $('#' + active).show();
  
    return false;
  },

  questionClick: function() {
    var question = $(this).parents('.question').prop('id');
  
    if(question == 'question-hardware') {
      if($(this).data('answer') == 'yes') {
        view.showQuestion('level');
      } else {
        view.showPanel('ffdn');
      }
  
    } else if(question == 'question-level') {
      if($(this).data('answer') == 'yes') {
        view.showQuestion('dotcube');
      } else {
        view.showPanel('ffdn');
      }
  
    } else if(question == 'question-dotcube') {
      if($(this).data('answer') == 'yes') {
        view.showPanel('vpn-dotcube');
      } else {
        view.showPanel('vpn-manual');
      }
  
      view.showButtonNext('lbi');
    }
  }
}


/************/
/*** MAIN ***/
/************/

$(document).ready(function() {
  view.setEvents();
});
