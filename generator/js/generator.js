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
      server_name: $('#vpn_server_name').val().trim(),
      server_port: $('#vpn_server_port').val().trim(),
      server_proto: $('input[name=vpn_server_proto]:checked').val().trim(),
      ip6_net: $('#vpn_ip6_net').val().trim(),
      crt_server_ca: cube.crtFilesContent.crt_server_ca,
      crt_client: cube.crtFilesContent.crt_client,
      crt_client_key: cube.crtFilesContent.crt_client_key,
      crt_client_ta: cube.crtFilesContent.crt_client_ta,
      login_user: $('#vpn_login_user').val().trim(),
      login_passphrase: $('#vpn_login_passphrase').val().trim(),
      dns0: $('#vpn_dns0').val().trim(),
      dns1: $('#vpn_dns1').val().trim(),
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
  
    var downloadLink = $('<a>', {
      text: 'config.cube',
      download: 'config.cube',
      href: fileContent
    });
  
    downloadLink.appendTo('body');
  }
};

var hypercube = {
  toJson: function(callback) {
    cube.toJson(hypercube.doToJson, callback);
  },

  doToJson: function(cubeJson, callback) {
    var json = {
      vpnclient: cubeJson,

      hotspot: {
        wifi_ssid: $('#hotspot_wifi_ssid').val().trim(),
        wifi_passphrase: $('#hotspot_wifi_passphrase').val().trim(),
        ip6_net: $('#hotspot_ip6_net').val().trim(),
        ip6_dns0: $('#hotspot_ip6_dns0').val().trim(),
        ip6_dns1: $('#hotspot_ip6_dns1').val().trim(),
        ip4_dns0: $('#hotspot_ip4_dns0').val().trim(),
        ip4_dns1: $('#hotspot_ip4_dns1').val().trim(),
        ip4_nat_prefix: $('#hotspot_ip4_nat_prefix').val().trim(),
        firmware_nonfree: $('#hotspot_firmware_nonfree').is(':checked') ? 'yes' : 'no'
      },

      yunohost: {
        domain: $('#ynh_domain').val().trim(),
        add_domain: $('#ynh_add_domain').val().trim(),
        password: $('#ynh_password').val().trim(),
        user: $('#ynh_user').val().trim(),
        user_firstname: $('#ynh_user_firstname').val().trim(),
        user_lastname: $('#ynh_user_lastname').val().trim(),
        user_password: $('#ynh_user_password').val().trim()
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
};


/************/
/*** VIEW ***/
/************/

var view = {
  showQuestion: function(question) {
    view.hideButtonNext();

    $('.question').hide();
    $('#question-' + question).show();
  },

  showStep: function(step) {
    $('#timeline').find('li.active').removeClass('active');
    $('#timeline a[data-tab=' + step + ']').parent().addClass('active');

    if(step == 'aboutyou') {
      view.showQuestion('hardware');
    }

    if(step == 'vpn') {
      if($('#vpn-choice').data('auto') == 'yes') {
        step += '-auto';
      } else {
        step += '-manual';
      }
    }

    $('.panel').hide();
    $('#panel-' + step + ' .nav-tabs li:first-child a').click();
    $('#panel-' + step).show();
  },
  
  showButtonNext: function(nextStep) {
    $('#button-next').data('next-panel', nextStep);
    $('#button-next').show();
  },

  hideButtonNext: function() {
    $('#button-next').hide();
  },

  i18n: function() {
    $('[data-title]').each(function() {
      $(this).data('title', $(this).data('title').replace("_('", '').replace("')", ''));
    });
  
    $('h1, h2, h3, h4, label, span, a, strong, em, button, .i18n').each(function() {
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

    $('form').submit(navigation.formNextSubmit);
    $('.nav-wizard a').click(navigation.timelineClick);
    $('.nav-tabs a').click(navigation.tabClick);
    $('.nav-pills a').click(navigation.questionClick);
    $('.fileinput').click(controller.fileInputClick);
    $('.deletefile').click(controller.deleteFileButtonClick);
    $('input[type="file"]').change(controller.fileInputChange);
    $('#button-next').click(controller.nextButtonClick);
    $('#button-submit').click(controller.submitButtonClick);
    $('#ynh_domain').blur(controller.dynetteCheckingBlur);
    $('#vpn_ip6_net').blur(controller.vpnIp6NetBlur);
    $('#ynh_password').blur(controller.ynhPasswordBlur);
    $('#vpn_auth_type').find('input').change(controller.vpnAuthTypeChange);
  }
};


/*******************/
/*** CONTROLLERS ***/
/*******************/

var controller = {
  vpnAuthTypeChange: function() {
    var name = $(this).data('auth');
  
    if($(this).is(':checked')) {
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
    var nextStep = $(this).data('next-panel');
    navigation.goToStep(nextStep);
  },

  formNextSubmit: function() {
    if($('#button-next').is(':visible')) {
      $('#button-next').click();
    }
  },

  submitButtonClick: function() {
    if(validation.form()) {
      controller.formSubmit();
    }
  },

  formSubmit: function() {
    cube.toJson(cube.proposeDownload);
    hypercube.toJson(hypercube.proposeDownload);

    return false;
  },

  dynetteCheckingBlur: function() {
    var dynette = $('.dynette');
    var dynetteText = dynette.find('span');

    dynette.removeClass('available');
    dynette.removeClass('notavailable');
    dynette.removeClass('dynetterror');

    if($(this).val().trim().match(/\.nohost\.me$/) || $(this).val().trim().match(/\.noho\.st$/)) {
      $.ajax({
        url: 'http://dyndns.yunohost.org/test/' + $(this).val().trim(),
        crossDomain: true,

        error: function(jqXHR, textStatus, errorThrown) {
          dynette.addClass('dynetterror');
          dynetteText.text(_("Cannot check the domain availability"));

          dynette.hide();
          dynette.fadeIn();
        },

        success: function(data) {
          var msg = $.parseJSON(data.responseText);
  
          if(msg['error']) {
            dynette.addClass('notavailable');
            dynetteText.text(_("This domain is not available"));
          } else {
            dynette.addClass('available');
            dynetteText.text(_("This domain is available"));
          }
  
          dynette.hide();
          dynette.fadeIn();
        }
      });
    }
  },

  vpnIp6NetBlur: function() {
    if(!$('#hotspot_ip6_net').val().trim()) {
      $('#hotspot_ip6_net').val($(this).val().trim());
    }
  },

  ynhPasswordBlur: function() {
    if(!$('#ynh_user_password').val().trim()) {
      $('#ynh_user_password').val($(this).val().trim());
    }
  }

};

var navigation = {
  goToStep: function(step, ignoreWarns = false) {
    var currentStep = $('#main').data('current-step');

    if(currentStep == 'aboutyou') {
      if(!validation.aboutyou() && !ignoreWarns) {
        return false;
      }
    }

    if(currentStep == 'vpn') {
      if(!validation.vpn() && !ignoreWarns) {
        return false;
      }
    }

    if(currentStep == 'postinstall' && !ignoreWarns) {
      if(!validation.postinstall()) {
        return false;
      }
    }

    $('#main').data('current-step', step);

    if(step == 'aboutyou' || step == 'ffdn') {
      view.hideButtonNext();
    }

    if(step == 'vpn') {
      view.showButtonNext('postinstall');
    }

    if(step == 'postinstall') {
      view.showButtonNext('download');
    }

    view.showStep(step);
  },

  timelineClick: function() {
    var step = $(this).data('tab');
    navigation.goToStep(step, true);
  },

  tabClick: function () {
    var active = $(this).data('tab');
  
    $(this).parents('.nav').find('li.active').removeClass('active');
    $(this).parent().addClass('active');
    $(this).parents('ul').parent().find('.tab').hide();

    $('#' + active).show();
  
    return false;
  },

  questionClick: function() {
    var question = $(this).parents('.question').prop('id');
  
    if(question == 'question-hardware') {
      if($(this).data('answer') == 'yes') {
        view.showQuestion('level');
      } else {
        navigation.goToStep('ffdn');
      }
  
    } else if(question == 'question-level') {
      if($(this).data('answer') == 'yes') {
        view.showQuestion('dotcube');
      } else {
        navigation.goToStep('ffdn');
      }
  
    } else if(question == 'question-dotcube') {
      $('#vpn-choice').data('auto', $(this).data('answer'));
      navigation.goToStep('vpn');
    }
  }
};

var validation = {
  warnings: {
    reset: function(panel) {
      var warnings = $('#panel-' + panel + ' .alert-danger');
      var step = panel.match(/^vpn-/) ? 'vpn' : panel;

      $('#timeline a[data-tab=' + step + ']').parent().addClass('warnings');
      $('#panel-' + panel + ' .control-label').css('color', 'white');
      $('#panel-' + panel + ' .hasWarnings').removeClass('hasWarnings');

      warnings.each(function(i) {
        if(i == 0) {
          $(this).hide();
          $(this).fadeIn();
        } else {
          if($(this).closest('.form-group')) {
            $(this).closest('.form-group').remove();
          } else {
            $(this).remove();
          }
        }
      });
    },

    add: function(field, msg) {
      var warnings = $('.alert-danger').first().clone();
      var warnMsg = warnings.find('strong');

      warnMsg.text(msg);

      var formGroup = $('<div>', { class: 'form-group alert-input' });
      var label = $('<label>', { class: 'col-sm-3' });
      var col = $('<div>', { class: 'col-sm-9' });

      label.appendTo(formGroup);
      col.appendTo(formGroup);
      warnings.appendTo(col);

      var tab = $('#' + field).closest('.tab');

      if(tab) {
        $('a[data-tab=' + tab.attr('id') + ']').addClass('hasWarnings');
      }

      $('#' + field).closest('.form-group').before(formGroup);
      warnings.fadeIn();
    },

    none: function(panel) {
      var warnings = $('#panel-' + panel + ' .alert ul');
      var step = panel.match(/^vpn-/) ? 'vpn' : panel;

      $('#timeline a[data-tab=' + step + ']').parent().removeClass('warnings');
      $('#timeline a[data-tab=' + step + ']').parent().addClass('validated');

      $('#panel-' + panel + ' .control-label').css('color', 'white');
      warnings.parent().hide();
    }
  },

  helpers: {
    testMandatoryFields: function(fields) {
      var nbWarns = 0;

      $.each(fields, function(i, id) {
        if(!$('#' + id).val().trim()) {
          validation.warnings.add(id, _("This field is mandatory"));
          nbWarns++;
        }
      });

      return !nbWarns;
    },

    testIpFields: function(fields, ipVersion) {
      var nbWarns = 0;

      $.each(fields, function(i, id) {
        var isWarn = false;

        if(!$('#' + id).val().trim()) {
          return;
        }

        switch(ipVersion) {
          case 64:
            if(!ipaddr.isValid($('#' + id).val().trim())) {
              validation.warnings.add(id, _("This IP format looks bad"));
              isWarn = true;
            }
          break;

          case 4:
            if(!ipaddr.IPv4.isValid($('#' + id).val().trim())) {
              validation.warnings.add(id, _("This IPv4 format looks bad"));
              isWarn = true;
            }
          break;

          case 6:
            if(!ipaddr.IPv6.isValid($('#' + id).val().trim())) {
              validation.warnings.add(id, _("This IPv6 format looks bad"));
              isWarn = true;
            }
          break;
        }

        if(!isWarn) {
          $('#' + id).val(ipaddr.parse($('#' + id).val().trim()).toString());
        } else {
          nbWarns++;
        }
      });

      return !nbWarns;
    }
  },

  form: function() {
    validation.warnings.reset('download');

    if(!validation.vpn() || !validation.postinstall()) {
      validation.warnings.add('download', _("The configuration files cannot be generated because some steps still have warnings."));
      validation.warnings.add('download', _("Please fix them, then retry."));

      return false;
    }

    validation.warnings.none('download');

    return true;
  },

  aboutyou: function() {
    validation.warnings.none('aboutyou');

    return true;
  },

  vpn: function() {
    var auto = ($('#vpn-choice').data('auto') == 'yes');

    if(auto) {
      return validation.vpnAuto();
    }

    return validation.vpnManual();
  },

  vpnAuto: function() {
    var nbWarns = 0;
    validation.warnings.reset('vpn-auto');

    if(!$('#vpn_cubefile').val().trim()) {
      nbWarns++;
      validation.warnings.add('vpn_cubefile', _("No .cube file selected"));
    }

    if(nbWarns == 0) {
      validation.warnings.none('vpn-auto');

      return true;
    }

    return false;
  },

  vpnManual: function() {
    var nbWarns = 0;
    validation.warnings.reset('vpn-manual');

    var ip6Fields = [ 'vpn_ip6_net' ];
    var ipFields = [ 'vpn_dns0', 'vpn_dns1' ];
    var mandatoryFields = [ 'vpn_server_name', 'vpn_server_port', 'vpn_crt_server_ca', 'vpn_dns0', 'vpn_dns1' ];

    if($('input[data-auth=vpn_auth_type_crt]').is(':checked')) {
      mandatoryFields.push('vpn_crt_client');
      mandatoryFields.push('vpn_crt_client_key');
    }

    if($('input[data-auth=vpn_auth_type_login]').is(':checked')) {
      mandatoryFields.push('vpn_login_user');
      mandatoryFields.push('vpn_login_passphrase');
    }

    if($('input[data-auth=vpn_auth_type_ta]').is(':checked')) {
      mandatoryFields.push('vpn_crt_client_ta');
    }

    if(!validation.helpers.testMandatoryFields(mandatoryFields)) {
      nbWarns++;
    }

    if(!validation.helpers.testIpFields(ip6Fields, 6)) {
      nbWarns++;
    }

    if(!validation.helpers.testIpFields(ipFields, 64)) {
      nbWarns++;
    }

    if($('#vpn_server_port').val().trim() && !$('#vpn_server_port').val().match(/^[0-9]+/)) {
      validation.warnings.add('vpn_server_port', _("Must be only composed of digits"));
      nbWarns++;
    }

    if(nbWarns == 0) {
      validation.warnings.none('vpn-manual');

      return true;
    }

    return false;
  },

  postinstall: function() {
    var nbWarns = 0;
    validation.warnings.reset('postinstall');

    var ip6Fields = [ 'hotspot_ip6_net', 'hotspot_ip6_dns0', 'hotspot_ip6_dns1' ];
    var ip4Fields = [ 'hotspot_ip4_dns0', 'hotspot_ip4_dns1' ];

    var mandatoryFields = [ 'ynh_user', 'ynh_password', 'ynh_domain', 'hotspot_wifi_ssid',
      'hotspot_wifi_passphrase', 'ynh_user_firstname', 'ynh_user_lastname', 'ynh_user_password',
      'hotspot_ip6_dns0', 'hotspot_ip6_dns1', 'hotspot_ip4_dns0', 'hotspot_ip4_dns1', 'hotspot_ip4_nat_prefix' ];

    if(!validation.helpers.testMandatoryFields(mandatoryFields)) {
      nbWarns++;
    }

    if(!validation.helpers.testIpFields(ip6Fields, 6)) {
      nbWarns++;
    }

    if(!validation.helpers.testIpFields(ip4Fields, 4)) {
      nbWarns++;
    }

    var ip4_nat_prefix = $('#hotspot_ip4_nat_prefix').val().trim();

    if(ip4_nat_prefix) {
      var privateRanges = [ '10.0.0.0', '172.16.0.0', '192.168.0.0' ];
      var cidrRanges = [ 8, 12, 16 ];
      var isMatchPrivateRange = false;

      ip4_nat_prefix = ip4_nat_prefix.trim().replace(/^([0-9]+\.[0-9]+\.[0-9]+).0$/, '$1');
      $('#hotspot_ip4_nat_prefix').val(ip4_nat_prefix);
      ip4_nat_prefix += '.0';

      if(!ipaddr.IPv4.isValid(ip4_nat_prefix)) {
        validation.warnings.add('hotspot_ip4_nat_prefix', _("This IPv4 prefix looks bad (required format is x.x.x or x.x.x.0)"));
        nbWarns++;

      } else {
        $.each(privateRanges, function(i, range) {
          var addr = ipaddr.parse(ip4_nat_prefix);

          if(addr.match(ipaddr.parse(range), cidrRanges[i])) {
            isMatchPrivateRange = true;
          }
        });

        if(!isMatchPrivateRange) {
          validation.warnings.add('hotspot_ip4_nat_prefix', _("This prefix must be part of an IPv4 private range"));
          nbWarns++;
        }
      }
    }

    if($('#ynh_user').val().trim()) {
      if(!$('#ynh_user').val().trim().match(/^[a-z0_9]+$/)) {
        validation.warnings.add('ynh_user', _("Only lowercase letters and digits are allowed"));
        nbWarns++;
  
      } else if($('#ynh_user').val().trim() == 'admin') {
        validation.warnings.add('ynh_user', _("Admin is not an authorized value"));
        nbWarns++;
      }
    }

    if($('#ynh_password').val().trim() && !$('#ynh_password').val().trim().length < 4) {
      validation.warnings.add('ynh_password', _("Must be greater than 4 characters"));
      nbWarns++;
    }

    if($('#hotspot_wifi_passphrase').val().trim() && !$('#hotspot_wifi_passphrase').val().trim().match(/^[ -~]+$/)) {
      validation.warnings.add('hotspot_wifi_passphrase', _("Only printable ASCII characters are allowed"));
      nbWarns++;
    }

    if($('#hotspot_wifi_passphrase').val().trim() && $('#hotspot_wifi_passphrase').val().trim().length < 3 || $('#hotspot_wifi_passphrase').val().trim().length > 63) {
      validation.warnings.add('hotspot_wifi_passphrase', _("Must from 8 to 63 characters (WPA2 passphrase)"));
      nbWarns++;
    }

    if(nbWarns == 0) {
      validation.warnings.none('postinstall');

      return true;
    }

    return false;
  }
};


/************
 *** I18N ***
 ************/

function _(msg) {
  return msg;
}


/************/
/*** MAIN ***/
/************/

$(document).ready(function() {
  view.setEvents();
});
