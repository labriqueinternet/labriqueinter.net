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

// <?


/**************
 *** MODELS ***
 **************/

var cube = {
  helpers: {
    compressCertificate: function (txt) {
      if(txt) {
        txt = txt.replace(/\n/g, '|');
        txt = txt.replace(/^.*\|(-.*-\|.*\|-.*-)\|.*$/, '$1');
      }
    
      return txt;
    },

    decompressCertificate: function(txt) {
      if(txt) {
        txt = txt.replace(/\|/g, "\n");
      }

      return txt;
    }
  },

  fromJson: function(json) {
    $('#vpn_server_name').val(json['server_name']);
    $('#vpn_server_port').val(json['server_port']);
    $('#vpn_dns0').val(json['dns0']);
    $('#vpn_dns1').val(json['dns1']);
    $('#vpn_ip6_net').val(json['ip6_net']);
    $('#vpn_login_user').val(json['login_user']);
    $('#vpn_login_passphrase').val(json['login_passphrase']);
    $('#vpn_openvpn_rm').val(json['openvpn_rm'].join("\n"));
    $('#vpn_openvpn_add').val(json['openvpn_add'].join("\n"));

    if(!$('#vpn_server_proto_' + json['server_proto']).is(':checked')) {
      $('#vpn_server_proto_' + json['server_proto']).click();
    }

    if($('input[data-auth=vpn_auth_type_login]').is(':checked') ? !json['login_user'] : json['login_user']) {
      $('input[data-auth=vpn_auth_type_login]').click();
    }

    $('#vpn_crt_server_ca_deletebtn').click();
    $('#vpn_crt_server_ca_edition').val(cube.helpers.decompressCertificate(json['crt_server_ca']));

    if(json['crt_server_ca']) {
      if($('#vpn_crt_server_ca_editbtn').find('span').hasClass('glyphicon-pencil')) {
        $('#vpn_crt_server_ca_editbtn').click();
      }
    } else {
      if($('#vpn_crt_server_ca_editbtn').hasClass('glyphicon-upload')) {
        $('#vpn_crt_server_ca_editbtn').click();
      }
    }

    $('#vpn_crt_client_key_deletebtn').click();
    $('#vpn_crt_client_key_edition').val(cube.helpers.decompressCertificate(json['crt_client_key']));

    if(json['crt_client_key']) {
      if(!$('input[data-auth=vpn_auth_type_crt]').is(':checked')) {
        $('input[data-auth=vpn_auth_type_crt]').click();
      }

      if($('#vpn_crt_client_key_editbtn').find('span').hasClass('glyphicon-pencil')) {
        $('#vpn_crt_client_key_editbtn').click();
      }
    } else {
      if($('input[data-auth=vpn_auth_type_crt]').is(':checked')) {
        $('input[data-auth=vpn_auth_type_crt]').click();
      }

      if($('#vpn_crt_client_key_editbtn').hasClass('glyphicon-upload')) {
        $('#vpn_crt_client_key_editbtn').click();
      }
    }

    $('#vpn_crt_client_deletebtn').click();
    $('#vpn_crt_client_edition').val(cube.helpers.decompressCertificate(json['crt_client']));

    if(json['crt_client']) {
      if($('#vpn_crt_client_editbtn').find('span').hasClass('glyphicon-pencil')) {
        $('#vpn_crt_client_editbtn').click();
      }
    } else {
      if($('#vpn_crt_client_editbtn').hasClass('glyphicon-upload')) {
        $('#vpn_crt_client_editbtn').click();
      }
    }

    $('#vpn_crt_ta_deletebtn').click();
    $('#vpn_crt_ta_edition').val(cube.helpers.decompressCertificate(json['crt_ta']));

    if(json['crt_ta']) {
      if(!$('input[data-auth=vpn_auth_type_ta]').is(':checked')) {
        $('input[data-auth=vpn_auth_type_ta]').click();
      }

      if($('#vpn_crt_ta_editbtn').find('span').hasClass('glyphicon-pencil')) {
        $('#vpn_crt_ta_editbtn').click();
      }
    } else {
      if($('input[data-auth=vpn_auth_type_ta]').is(':checked')) {
        $('input[data-auth=vpn_auth_type_ta]').click();
      }

      if($('#vpn_crt_ta_editbtn').hasClass('glyphicon-upload')) {
        $('#vpn_crt_ta_editbtn').click();
      }
    }
  },

  fromJsonTxt: function(json) {
    return cube.fromJson(JSON.parse(json));
  },

  toJson: function() {
    var json = {
      server_name: $('#vpn_server_name').val().trim(),
      server_port: $('#vpn_server_port').val().trim(),
      server_proto: $('input[name=vpn_server_proto]:checked').val(),
      ip6_net: $('#vpn_ip6_net').val().trim(),
      crt_server_ca: cube.helpers.compressCertificate($('#vpn_crt_server_ca_edition').val()),
      crt_client: cube.helpers.compressCertificate($('#vpn_crt_client_edition').val()),
      crt_client_key: cube.helpers.compressCertificate($('#vpn_crt_client_key_edition').val()),
      crt_client_ta: cube.helpers.compressCertificate($('#vpn_crt_client_ta_edition').val()),
      login_user: $('#vpn_login_user').val().trim(),
      login_passphrase: $('#vpn_login_passphrase').val().trim(),
      dns0: $('#vpn_dns0').val().trim(),
      dns1: $('#vpn_dns1').val().trim(),
      openvpn_rm: $('#vpn_openvpn_rm').val().split("\n"),
      openvpn_add: $('#vpn_openvpn_add').val().split("\n")
    };

    return json;
  },

  toJsonTxt: function(json) {
    return JSON.stringify(json, null, 2);
  },

  downloadLink: function(json) {
    var fileContent = window.btoa(cube.toJsonTxt(json));
    fileContent = "data:application/octet-stream;base64," + fileContent;

    $('#cubelink').attr('href', fileContent);
    $('#cubelink').attr('download', 'config.cube');

    $('#cubelink').parent().hide();
    $('#cubelink').parent().fadeIn();
  }
};

var hypercube = {
  toJson: function() {
    var json = {
      vpnclient: cube.toJson(),

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

    return json;
  },

  toJsonTxt: function(json) {
    return JSON.stringify(json, null, 2);
  },

  downloadLink: function(json) {
    var fileContent = window.btoa(hypercube.toJsonTxt(json));
    fileContent = "data:application/octet-stream;base64," + fileContent;
  
    $('#hypercubelink').attr('href', fileContent);
    $('#hypercubelink').attr('download', 'install.hypercube');

    $('#hypercubelink').parent().hide();
    $('#hypercubelink').parent().fadeIn();
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

  fileInputDelButtonsSynchro: function() {
    var delButtons = $('.deletefile');

    delButtons.each(function() {
      var fileInput = $('#' + $(this).attr('id').replace(/_deletebtn/, ''));

      if(fileInput.val()) {
        $(this).fadeIn();
      } else {
        $(this).hide();
      }
    });
  },

  checkboxesSynchro: function() {
    $('input[type=radio],input[type=checkbox]').each(function() {
      if($(this).is(':checked') ? !$(this).parent().hasClass('active') : $(this).parent().hasClass('active')) {
        $(this).click();
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
    $('.fileinput').change(controller.fileInputChange);
    $('.deletefile').click(controller.deleteFileButtonClick);
    $('.editfile').click(controller.editFileButtonClick);
    $('.fileedition').change(controller.fileEditionChange);
    $('input[type="file"]').change(controller.fileInputChange);
    $('#button-next').click(controller.nextButtonClick);
    $('#button-submit').click(controller.submitButtonClick);
    $('#ynh_domain').change(controller.dynetteCheckingChange);
    $('#vpn_ip6_net').change(controller.vpnIp6NetChange);
    $('#ynh_password').change(controller.ynhPasswordChange);
    $('#vpn_auth_type').find('input').change(controller.vpnAuthTypeChange);
    $('#modifycubefile').click(controller.modifyCubeFileClick);
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

  deleteFileButtonClick: function() {
    var textInput = $('#' + $(this).attr('id').replace(/_deletebtn$/, '_choosertxt'));
    var fileInput = $('#' + $(this).attr('id').replace(/_deletebtn$/, ''));
    var fileEdition = $('#' + $(this).attr('id').replace(/_deletebtn$/, '_edition'));

    textInput.val('');
    fileInput.val('');
    fileEdition.val('');

    $(this).hide();
  },

  editFileButtonClick: function() {
    var delButton = $('#' + $(this).attr('id').replace(/_editbtn$/, '_deletebtn'));
    var textInput = $('#' + $(this).attr('id').replace(/_editbtn$/, '_choosertxt'));
    var fileEdition = $('#' + $(this).attr('id').replace(/_editbtn$/, '_edition'));

    delButton.hide();
    textInput.hide();
    fileEdition.show();

    $(this).find('.glyphicon').addClass('glyphicon-upload');
    $(this).find('.glyphicon').removeClass('glyphicon-pencil');
    $(this).attr('data-original-title', _("Select file mode"));
    $(this).unbind('click');
    $(this).click(controller.uploadFileButtonClick);
    $(this).tooltip('hide');
  },

  uploadFileButtonClick: function() {
    var delButton = $('#' + $(this).attr('id').replace(/_editbtn$/, '_deletebtn'));
    var fileEdition = $('#' + $(this).attr('id').replace(/_editbtn$/, '_edition'));
    var textInput = $('#' + $(this).attr('id').replace(/_editbtn$/, '_choosertxt'));
    var fileInput = $('#' + $(this).attr('id').replace(/_editbtn/, ''));

    if(fileEdition.data('changed')) {
      delButton.click();
    } else if(fileInput.val()) {
      delButton.show();
    }

    fileEdition.hide();
    textInput.show();

    $(this).find('.glyphicon').addClass('glyphicon-pencil');
    $(this).find('.glyphicon').removeClass('glyphicon-upload');
    $(this).attr('data-original-title', _("Edition mode"));
    $(this).unbind('click');
    $(this).click(controller.editFileButtonClick);
    $(this).tooltip('hide');
  },

  fileInputClick: function() {
    var fileInput = $('#' + $(this).attr('id').replace(/_chooser.*$/, ''));
    var textInput = $('#' + $(this).attr('id').replace(/_chooser.*$/, '_choosertxt'));
    var fileEdition = $('#' + $(this).attr('id').replace(/_chooser.*$/, '_edition'));

    fileInput.click();
    textInput.blur();
  },

  fileInputChange: function() {
    var textInput = $('#' + $(this).attr('id') + '_choosertxt');
    var delButton = $('#' + $(this).attr('id') + '_deletebtn');
    var fileEdition = $('#' + $(this).attr('id') + '_edition');
    var crtFiles = $('#' + $(this).attr('id')).prop('files');
    var fileInput = $(this);

    if(crtFiles.length > 0) {
      var fileReader = new FileReader();
      fileReader.readAsText(crtFiles[0]);
      fileEdition.val('');

      fileReader.onload = function(e) {
        fileEdition.val(e.target.result);
        fileEdition.data('changed', false);

        if(fileInput.attr('id') == 'vpn_cubefile') {
          controller.loadCubeFile();

          $('#vpn_ip6_net').change();
          $('#modifycubefile').fadeIn();
        }
      };

      fileReader.onerror = function(e) {
        alert(_("Cannot read this file"));
        delButton.click();
      }
    }

    textInput.val($(this).val().replace(/^.*[\/\\]/, ''));

    if(!fileEdition.is(':visible')) {
      delButton.fadeIn();
    }
  },

  fileEditionChange: function() {
    $(this).data('changed', true);
  },

  loadCubeFile: function() {
    var fileEdition = $('#vpn_cubefile_edition');
    cube.fromJsonTxt(fileEdition.val());
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
      controller.submitForm();
    }
  },

  submitForm: function() {
    cube.downloadLink(cube.toJson());
    hypercube.downloadLink(hypercube.toJson());

    return false;
  },

  dynetteCheckingChange: function() {
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

  vpnIp6NetChange: function() {
    if(!$('#hotspot_ip6_net').val().trim()) {
      $('#hotspot_ip6_net').val($(this).val().trim());
    }
  },

  ynhPasswordChange: function() {
    if(!$('#ynh_user_password').val().trim()) {
      $('#ynh_user_password').val($(this).val().trim());
    }
  },

  modifyCubeFileClick: function() {
    $('#vpn-choice').data('auto', 'no');
    $('#vpn_cubefile').val('');
    $('#vpn_cubefile_edition').val('');

    navigation.goToStep('vpn-manual', true);
  }
};

var navigation = {
  goToStep: function(step, ignoreWarns) {
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

    if(currentStep == 'postinstall') {
      if(!validation.postinstall() && !ignoreWarns) {
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

    if(step == 'download') {
      view.hideButtonNext();
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
    var question = $(this).parents('.question').attr('id');
  
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
      var mainWarning = $('#panel-' + panel + ' .alert-danger').first();
      var warnings = $('#panel-' + panel + ' .alert-input');
      var step = panel.match(/^vpn-/) ? 'vpn' : panel;

      $('#timeline a[data-tab=' + step + ']').parent().addClass('warnings');
      $('#panel-' + panel + ' .control-label').css('color', 'white');
      $('#panel-' + panel + ' .hasWarnings').removeClass('hasWarnings');

      mainWarning.hide();
      //mainWarning.fadeIn(); // synchronous
      mainWarning.show();

      warnings.each(function() {
        $(this).closest('.form-group').remove();
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
      var warnings = $('#panel-' + panel + ' .alert-danger');
      var step = panel.match(/^vpn-/) ? 'vpn' : panel;

      $('#timeline a[data-tab=' + step + ']').parent().removeClass('warnings');
      $('#timeline a[data-tab=' + step + ']').parent().addClass('validated');

      warnings.hide();
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
    var nbWarns = 0;
    validation.warnings.reset('download');

    $('#vpn-choice').data('auto', 'no');
    $('#vpn_cubefile').val('');
    $('#vpn_cubefile_edition').val('');

    if(!validation.vpn()) {
      nbWarns++;
    }

    if(!validation.postinstall()) {
      nbWarns++;
    }

    if(nbWarns > 0) {
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

    if(!nbWarns) {
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
    var mandatoryFields = [ 'vpn_server_name', 'vpn_server_port', 'vpn_crt_server_ca_edition', 'vpn_dns0', 'vpn_dns1' ];

    if($('input[data-auth=vpn_auth_type_crt]').is(':checked')) {
      mandatoryFields.push('vpn_crt_client_edition');
      mandatoryFields.push('vpn_crt_client_key_edition');
    }

    if($('input[data-auth=vpn_auth_type_login]').is(':checked')) {
      mandatoryFields.push('vpn_login_user');
      mandatoryFields.push('vpn_login_passphrase');
    }

    if($('input[data-auth=vpn_auth_type_ta]').is(':checked')) {
      mandatoryFields.push('vpn_crt_client_ta_edition');
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

    if($('#vpn_server_port').val().trim() && !$('#vpn_server_port').val().match(/^[0-9]+$/)) {
      validation.warnings.add('vpn_server_port', _("Must be only composed of digits"));
      nbWarns++;
    }

    if(!nbWarns) {
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

    if($('#ynh_password').val().trim() && $('#ynh_password').val().trim().length < 4) {
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

    if(!nbWarns) {
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
  view.fileInputDelButtonsSynchro();
  view.checkboxesSynchro();
});
