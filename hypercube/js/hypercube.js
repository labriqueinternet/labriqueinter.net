/* HyperCube Service for the Internet Cube Project
 * Copyright (C) 2016 Julien Vaubourg <julien@vaubourg.com>
 * Contribute at https://github.com/labriqueinternet/labriqueinter.net/tree/master/hypercube
 * Report issues at https://dev.yunohost.org/projects/la-brique-internet/issues
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

/***************
 *** GLOBALS ***
 ***************/

// e.g. /hypercube/ or /
const WEBPATH = '/beta/';


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
    if(!json['server_name']) {
      return false;
    }

    $('#vpn_server_name').val(json['server_name']);
    $('#vpn_server_port').val(json['server_port']);
    $('#vpn_dns0').val(json['dns0']);
    $('#vpn_dns1').val(json['dns1']);
    $('#vpn_ip6_net').val(json['ip6_net']);
    $('#vpn_ip4_addr').val(json['ip4_addr']);
    $('#vpn_login_user').val(json['login_user']);
    $('#vpn_login_passphrase').val(json['login_passphrase']);
    $('#vpn_login_passphrase_repeat').val(json['login_passphrase']);
    $('#vpn_openvpn_rm').val(json['openvpn_rm'].join("\n"));
    $('#vpn_openvpn_add').val(json['openvpn_add'].join("\n"));

    if(!$('#vpn_server_proto_' + json['server_proto']).is(':checked')) {
      $('#vpn_server_proto_' + json['server_proto']).click();
      $('#vpn_server_proto_' + json['server_proto']).prop('checked', true);
    }

    if($('input[data-auth=vpn_auth_type_login]').is(':checked') ? !json['login_user'] : json['login_user']) {
      $('input[data-auth=vpn_auth_type_login]').click();
      $('input[data-auth=vpn_auth_type_login]').prop('checked', json['login_user']);
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
        $('input[data-auth=vpn_auth_type_crt]').prop('checked', true);
      }

      if($('#vpn_crt_client_key_editbtn').find('span').hasClass('glyphicon-pencil')) {
        $('#vpn_crt_client_key_editbtn').click();
      }
    } else {
      if($('input[data-auth=vpn_auth_type_crt]').is(':checked')) {
        $('input[data-auth=vpn_auth_type_crt]').click();
        $('input[data-auth=vpn_auth_type_crt]').prop('checked', false);
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
        $('input[data-auth=vpn_auth_type_ta]').prop('checked', true);
      }

      if($('#vpn_crt_ta_editbtn').find('span').hasClass('glyphicon-pencil')) {
        $('#vpn_crt_ta_editbtn').click();
      }
    } else {
      if($('input[data-auth=vpn_auth_type_ta]').is(':checked')) {
        $('input[data-auth=vpn_auth_type_ta]').click();
        $('input[data-auth=vpn_auth_type_ta]').prop('checked', false);
      }

      if($('#vpn_crt_ta_editbtn').hasClass('glyphicon-upload')) {
        $('#vpn_crt_ta_editbtn').click();
      }
    }

    return true;
  },

  fromJsonTxt: function(json) {
    try {
      return cube.fromJson(JSON.parse(json));

    } catch(e) {
      if(/json/i.test(e)) {
        throw 'syntax';
      }

      throw e;
    }
  },

  toJson: function() {
    var json = {
      server_name: $('#vpn_server_name').val().trim().toLowerCase(),
      server_port: $('#vpn_server_port').val().trim(),
      server_proto: $('input[name=vpn_server_proto]:checked').val(),
      ip6_net: $('#vpn_ip6_net').val().trim(),
      ip4_addr: $('#vpn_ip4_addr').val().trim(),
      crt_server_ca: cube.helpers.compressCertificate($('#vpn_crt_server_ca_edition').val()),
      crt_client: cube.helpers.compressCertificate($('#vpn_crt_client_edition').val()),
      crt_client_key: cube.helpers.compressCertificate($('#vpn_crt_client_key_edition').val()),
      crt_client_ta: cube.helpers.compressCertificate($('#vpn_crt_ta_edition').val()),
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
    try {
      var fileContent = window.btoa(cube.toJsonTxt(json));

      fileContent = "data:application/octet-stream;base64," + fileContent;

      $('.cubelink').attr('href', fileContent);
      $('.cubelink').attr('download', 'config.cube');

      var downloadViewTxt = $('.cubelink').parent().next();
      downloadViewTxt.val(cube.toJsonTxt(json));

    } catch(e) {
      if(/invalid/i.test(e)) {
        alert(_("ERROR: Invalid character found when preparing the download link."));

      } else {
        throw e;
      }
    }
  }
};

var hypercube = {
  fromJson: function(json) {
    if(!json['vpnclient'] || !cube.fromJson(json['vpnclient'])) {
      return false;
    }

    $('#ynh_domain').val(json['yunohost']['domain']);
    $('#ynh_domain').change();

    $('#ynh_password').val(json['yunohost']['password']);
    $('#ynh_password_repeat').val(json['yunohost']['password']);
    $('#ynh_user').val(json['yunohost']['user']);
    $('#ynh_user_name').val((json['yunohost']['user_firstname'] + ' ' + json['yunohost']['user_lastname']).trim());
    $('#ynh_user_password').val(json['yunohost']['user_password']);
    $('#ynh_user_password_repeat').val(json['yunohost']['user_password']);

    $('#hotspot_wifi_ssid').val(json['hotspot']['wifi_ssid']);
    $('#hotspot_wifi_passphrase').val(json['hotspot']['wifi_passphrase']);
    $('#hotspot_wifi_passphrase_repeat').val(json['hotspot']['wifi_passphrase']);
    $('#hotspot_ip6_net').val(json['hotspot']['ip6_net']);
    $('#hotspot_ip6_dns0').val(json['hotspot']['ip6_dns0']);
    $('#hotspot_ip6_dns1').val(json['hotspot']['ip6_dns1']);
    $('#hotspot_ip4_dns0').val(json['hotspot']['ip4_dns0']);
    $('#hotspot_ip4_dns1').val(json['hotspot']['ip4_dns1']);
    $('#hotspot_ip4_nat_prefix').val(json['hotspot']['ip4_nat_prefix']);
    $('#hotspot_ip4_nat_prefix').val(json['hotspot']['ip4_nat_prefix']);

    if($('#hotspot_firmware_nonfree').is(':checked') ? json['hotspot']['firmware_nonfree'] == 'no' : json['hotspot']['firmware_nonfree'] == 'yes') {
      $('#hotspot_firmware_nonfree').parent().click();
      $('#hotspot_firmware_nonfree').prop('checked', json['hotspot']['firmware_nonfree'] == 'yes');
    }

    $('#unix_root_password').val(json['unix']['root_password']);
    $('#unix_root_password_repeat').val(json['unix']['root_password']);

    navigation.goToStep('installation');

    return true;
  },

  fromJsonTxt: function(json) {
    try {
      return hypercube.fromJson(JSON.parse(json));

    } catch(e) {
      if(/json/i.test(e)) {
        throw 'syntax';
      }

      throw e;
    }
  },

  toJson: function() {
    var name = $('#ynh_user_name').val().trim();
    var firstname = name.replace(/^([^\s]+).*/, '$1');
    var lastname = name.replace(/^[^\s]+(.*)/, '$1');

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
        domain: $('#ynh_domain').val().trim().toLowerCase(),
        password: $('#ynh_password').val().trim(),
        user: $('#ynh_user').val().trim(),
        user_firstname: firstname.trim(),
        user_lastname: lastname.trim(),
        user_password: $('#ynh_user_password').val().trim()
      },

      unix: {
        root_password: $('#unix_root_password').val().trim()
      }
    };

    return json;
  },

  toJsonTxt: function(json) {
    return JSON.stringify(json, null, 2);
  },

  generateDnsZone: function() {
    var domain = $('#ynh_domain').val().trim();
    var ip6 = $('#vpn_ip6_net').val().trim() + '42';
    var ip4 = $('#vpn_ip4_addr').val().trim();

    var zone = '@ 14400 IN A ' + ip4
      + "\n" + '* 14400 IN A ' + ip4;

    if(ip6 != 42) {
      zone += "\n" + '@ 14400 IN AAAA ' + ip6
        + "\n" + '* 14400 IN AAAA ' + ip6;
    }

    zone += "\n" + '_xmpp-client._tcp 14400 IN SRV 0 5 5222 ' + domain + '.'
      + "\n" + '_xmpp-server._tcp 14400 IN SRV 0 5 5269 ' + domain + '.'
      + "\n" + '@ 14400 IN MX 5 ' + domain + '.';

    if(ip6 != 42) {
      zone += "\n" + '@ 14400 IN TXT "v=spf1 a mx ip4:' + ip4 + ' ip6:' + ip6 + ' -all"';
    } else {
      zone += "\n" + '@ 14400 IN TXT "v=spf1 a mx ip4:' + ip4 + ' -all"';
    }

    return zone;
  },

  downloadLink: function(json) {
    try {
      var fileContent = window.btoa(hypercube.toJsonTxt(json));
      fileContent = "data:application/octet-stream;base64," + fileContent;
  
      $('.hypercubelink').attr('href', fileContent);
      $('.hypercubelink').attr('download', 'install.hypercube');

      var downloadViewTxt = $('.hypercubelink').parent().next();
      downloadViewTxt.val(hypercube.toJsonTxt(json));

    } catch(e) {
      if(/invalid/i.test(e)) {
        alert(_("ERROR: Invalid character found when preparing the download link."));

      } else {
        throw e;
      }
    }
  }
};


/************/
/*** VIEW ***/
/************/

var view = {
  showQuestion: function(question) {
    view.hideButtonPrev();
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

    $('#alert-next').hide();
    $('html, body').animate({ scrollTop: 0 }, 'slow');
  },
  
  showButtonNext: function(nextStep) {
    $('#button-next').data('next-panel', nextStep);
    $('#button-next').show();
  },

  showButtonPrev: function(prevStep) {
    $('#button-prev').data('prev-panel', prevStep);
    $('#button-prev').show();
  },

  hideButtonNext: function() {
    $('#button-next').hide();
  },

  hideButtonPrev: function() {
    $('#button-prev').hide();
  },

  updateInstallGuide: function() {

    if($('#vpn_ip6_net').val().trim()) {
      $('#adminip6').text('https://[' + $('#vpn_ip6_net').val().trim() + '42]/admin/');
      $('#adminip6').attr('href', 'https://[' + $('#vpn_ip6_net').val().trim() + '42]/admin/');
      $('#showadminip6').show();
    } else {
      $('#showadminip6').hide();
    }

    if($('#vpn_ip4_addr').val().trim()) {
      $('#adminip4').text('https://' + $('#vpn_ip4_addr').val().trim() + '/admin/');
      $('#adminip4').attr('href', 'https://' + $('#vpn_ip4_addr').val().trim() + '/admin/');
      $('#showadminip4').show();
    } else {
      $('#showadminip4').hide();
    }

    if($('#ynh_domain').val().trim().match(/\.nohost\.me$/) || $('#ynh_domain').val().trim().match(/\.noho\.st$/)) {
      $('#dnsconfig').hide();
      $('#nodnsconfig').hide();
      $('#dnsconfigdynette').show();

    } else if($('#vpn_ip4_addr').val().trim()) {
      $('#dnsconfig').show();
      $('#nodnsconfig').hide();
      $('#dnsconfigdynette').hide();

    } else {
      $('#dnsconfig').hide();
      $('#nodnsconfig').show();
      $('#dnsconfigdynette').hide();
    }

    $('#adminip4priv').text('https://' + $('#hotspot_ip4_nat_prefix').val().trim() + '.1/admin/');
    $('#adminip4priv').attr('href', 'https://' + $('#hotspot_ip4_nat_prefix').val().trim() + '.1/admin/');
    $('#admindomain').text('https://' + $('#ynh_domain').val().trim() + '/admin/');
    $('#admindomain').attr('href', 'https://' + $('#ynh_domain').val().trim() + '/admin/');
    $('#wifiname').text($('#hotspot_wifi_ssid').val().trim());
    $('#wifipwd').text($('#hotspot_wifi_passphrase').val().trim());
    $('#ynhpwd').text($('#ynh_password').val().trim());
    $('.domainname').text($('#ynh_domain').val().trim());
    $('.dnszone').val(hypercube.generateDnsZone());
  },

  optionalFields: function() {
    $('label.optionalfield').each(function() {
      var spanSymbol = $('<span>', { class: 'glyphicon glyphicon-filter' });
      var spanText = $('<span>');

      spanText.text($(this).text());
      spanSymbol.tooltip({ title: _("Optional Field") });

      $(this).empty();
      $(this).append(spanSymbol);
      $(this).append(spanText);
    });
  },

  fileInputSynchro: function() {
    var fileInputs = $('.fileinput');

    fileInputs.each(function() {
      var delButton = $('#' + $(this).attr('id').replace(/_choosertxt$/, '_deletebtn'));
      var editButton = $('#' + $(this).attr('id').replace(/_choosertxt$/, '_editbtn'));
      var fileEdition = $('#' + $(this).attr('id').replace(/_choosertxt$/, '_edition'));

      if($(this).val()) {
        delButton.show();
      } else {
        delButton.hide();

        if(fileEdition.val()) {
          editButton.click();
        }
      }
    });
  },

  checkboxesSynchro: function() {
    $('input[type=radio],input[type=checkbox]').each(function() {
      if($(this).is(':checked') ? !$(this).parent().hasClass('active') : $(this).parent().hasClass('active')) {
        $(this).click();
      }

      $(this).change();
    });
  },

  dynetteCheckingSynchro: function() {
    $('#ynh_domain').change();
  },

  setEvents: function() {
    $(window).on('popstate', navigation.browserHistory);

    $('.btn-group').button();
    $('.switch').bootstrapToggle();

    $('.fileinput').click(controller.fileInputClick);
    $('.fileinput').change(controller.fileInputChange);
    $('.filebrowse').click(controller.fileInputClick);
    $('.deletefile').click(controller.deleteFileButtonClick);
    $('.editfile').click(controller.editFileButtonClick);
    $('.fileedition').change(controller.fileEditionChange);
    $('.downloadview').click(controller.downloadViewClick);
    $('input[type="file"]').change(controller.fileInputChange);
    $('#ynh_domain').change(controller.dynetteCheckingChange);
    $('#vpn_ip6_net').change(controller.vpnIp6NetChange);
    $('#ynh_password').change(controller.ynhPasswordChange);
    $('#ynh_user_name').change(controller.ynhUserNameChange);
    $('#vpn_auth_type').find('input').change(controller.vpnAuthTypeChange);
    $('#hypercube').change(controller.hyperCubeFileChange);
    $('#vpnauto').click(controller.vpnAutoClick);
    $('#custom_preinstalled').change(controller.customPreinstalledChange);
    $('#custom_encrypted').change(controller.customInstallSdChange);
    $('#custom_lime2').change(controller.customInstallSdChange);
    $('#showadminalt a').click(controller.showAlternativeAdminUrlsClick);
    $('.showpwd a').click(controller.showPwdClick);
    $('#registrars a').click(controller.registrarNameClick);
    $('#downloadpdf').click(controller.downloadPdf);

    $('form').submit(navigation.formSubmit);
    $('input').keypress(navigation.formSubmitEnterKey);
    $('.nav-wizard a').click(navigation.timelineClick);
    $('.nav-tabs a').click(navigation.tabClick);
    $('.nav-pills a').click(navigation.questionClick);
    $('#button-next').click(navigation.nextButtonClick);
    $('#button-prev').click(navigation.prevButtonClick);
    $('#modifycubefile').click(navigation.modifyCubeFileClick);
    $('#loadhypercube').click(navigation.loadHyperCubeClick);
    $('#start').click(navigation.startClick);

    navigation.browserHistory();
  }
};


/*******************/
/*** CONTROLLERS ***/
/*******************/

var controller = {
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
    $(this).attr('data-original-title', _("File selection mode"));
    $(this).unbind('click');
    $(this).click(controller.uploadFileButtonClick);
    $(this).tooltip('hide');
  },

  uploadFileButtonClick: function() {
    var delButton = $('#' + $(this).attr('id').replace(/_editbtn$/, '_deletebtn'));
    var fileEdition = $('#' + $(this).attr('id').replace(/_editbtn$/, '_edition'));
    var textInput = $('#' + $(this).attr('id').replace(/_editbtn$/, '_choosertxt'));
    var fileInput = $('#' + $(this).attr('id').replace(/_editbtn/, ''));

    if(fileEdition.data('changed') || !fileInput.val()) {
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

    if(fileInput.attr('id') == 'vpn_cubefile') {
      $('#modifycubefile').hide();
    }

    if(crtFiles.length > 0) {
      var fileReader = new FileReader();
      fileReader.readAsText(crtFiles[0]);
      fileEdition.val('');

      fileReader.onload = function(e) {
        fileEdition.val(e.target.result);
        fileEdition.data('changed', false);

        if(fileInput.attr('id') == 'vpn_cubefile') {
          controller.loadCubeFile();
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

  vpnAuthTypeChange: function() {
    var name = $(this).data('auth');
  
    if($(this).is(':checked')) {
      $('#' + name).show();
    } else {
      $('#' + name).hide();
    }
  },

  downloadViewClick: function() {
    var downloadViewTxt = $(this).parent().next();

    if(downloadViewTxt.is(':visible')) {
      downloadViewTxt.hide();
      $(this).find('span').addClass('glyphicon-eye-open');
      $(this).find('span').removeClass('glyphicon-eye-close');

    } else {
      downloadViewTxt.fadeIn();
      $(this).find('span').addClass('glyphicon-eye-close');
      $(this).find('span').removeClass('glyphicon-eye-open');

      downloadViewTxt.select();
      setTimeout(function() {
        downloadViewTxt.scrollTop(0);
      }, 100);
    }
  },

  loadCubeFile: function() {
    try {
      if(cube.fromJsonTxt($('#vpn_cubefile_edition').val())) {
        $('#vpn_ip6_net').change();
        $('#modifycubefile').fadeIn();

      } else {
        throw 'content';
      }

    } catch(e) {
      switch(e) {
        case 'syntax':
          alert(_("Invalid file (syntax error):") + ' ' + _("are you sure that this is a .cube file?"));
        break;

        case 'content':
          alert(_("Invalid file (content error):") + ' ' + _("are you sure that this is your .cube file?"));
        break;

        default:
          throw e;
      }
    }
  },

  submitForm: function() {
    $('#nodownloads').hide();
    $('#candownload').hide();
    $('#downloadcube').hide();
    $('#installguide').hide();

    view.updateInstallGuide();

    if(validation.all()) {
      cube.downloadLink(cube.toJson());
      hypercube.downloadLink(hypercube.toJson());

      $('#candownload').fadeIn();
      $('#installguide').fadeIn();

    } else if(validation.vpn()) {
      cube.downloadLink(cube.toJson());

      $('#nodownloads').fadeIn();
      $('#downloadcube').fadeIn();

    } else {
      $('#nodownloads').fadeIn();
    }
  },

  dynetteCheckingChange: function() {
    var dynette = $('.dynette');
    var dynetteText = dynette.find('span');

    dynette.removeClass('available');
    dynette.removeClass('notavailable');
    dynette.removeClass('dynetterror');

    if($(this).val().trim().match(/^[a-z0-9.-]+$/i) && ($(this).val().trim().match(/\.nohost\.me$/) || $(this).val().trim().match(/\.noho\.st$/))) {
      dynette.hide();
      dynetteText.text(_("Checking the avaibility of this domain..."));
      dynette.fadeIn();

      $(this).val($(this).val().toLowerCase());

      $.ajax({
        url: '//dyndns.yunohost.org/test/' + $(this).val().trim(),
        crossDomain: true,

        error: function(jqXHR, textStatus, errorThrown) {
          dynette.hide();

          if(jqXHR.status == 409) {
            dynette.addClass('notavailable');
            dynetteText.text(_("This domain is not available"));

          } else {
            dynette.addClass('dynetterror');
            dynetteText.text(_("Cannot check the domain availability (does not work offline)"));
          }

          dynette.fadeIn();
        },

        success: function(data) {
          dynette.hide();

          dynette.addClass('available');
          dynetteText.text(_("This domain is available"));

          dynette.fadeIn();
        }
      });

    } else {
      dynette.hide();
    }
  },

  vpnIp6NetChange: function() {
    var oldValue = $(this).data('old-value');

    if(!$('#hotspot_ip6_net').val().trim() || $('#hotspot_ip6_net').val().trim() == oldValue) {
      $('#hotspot_ip6_net').val($(this).val().trim());
    }

    $(this).data('old-value', $(this).val().trim());
  },

  ynhPasswordChange: function() {
    var oldValue = $(this).data('old-value');

    if(!$('#ynh_user_password').val().trim() || $('#ynh_user_password').val().trim() == oldValue) {
      $('#ynh_user_password').val($(this).val().trim());
      $('#ynh_user_password_repeat').val($(this).val().trim());
    }

    if(!$('#unix_root_password').val().trim() || $('#unix_root_password').val().trim() == oldValue) {
      $('#unix_root_password').val($(this).val().trim());
      $('#unix_root_password_repeat').val($(this).val().trim());
    }

    $(this).data('old-value', $(this).val().trim());
  },

  ynhUserNameChange: function() {
    var genUsername = function(name) {
      var username = '';

      if(name) {
        var nameparts = name.trim().split(/[-\s]+/);

        $.each(nameparts, function(i, part) {
          if(i != nameparts.length - 1) {
            username += part.trim().replace(/(.).*/, '$1');
          }
        });
        
        username += nameparts[nameparts.length - 1];
        username = username.toLowerCase();

        username = username.replace(/[àáâãäå]/g,'a');
        username = username.replace(/æ/g,'ae');
        username = username.replace(/ç/g,'c');
        username = username.replace(/[èéêë]/g,'e');
        username = username.replace(/[ìíîï]/g,'i');
        username = username.replace(/ñ/g,'n');                
        username = username.replace(/[òóôõö]/g,'o');
        username = username.replace(/œ/g,'oe');
        username = username.replace(/[ùúûü]/g,'u');
        username = username.replace(/[ýÿ]/g,'y');
        username = username.replace(/\W/g,'');
      }

      return username;
    };

    var oldValue = $(this).data('old-value');
    var oldUsername = genUsername(oldValue);

    if(!$('#ynh_user').val().trim() || $('#ynh_user').val().trim() == oldUsername) {
      $('#ynh_user').val(genUsername($(this).val()));
    }
    
    $(this).data('old-value', $(this).val().trim());
  },

  hyperCubeFileChange: function() {
    var hypercubeFiles = $(this).prop('files');

    if(hypercubeFiles.length > 0) {
      var fileReader = new FileReader();
      fileReader.readAsText(hypercubeFiles[0]);

      fileReader.onload = function(e) {
        try {
          if(hypercube.fromJsonTxt(e.target.result)) {
            $('#vpn_ip6_net').change();
            $('#ynh_domain').change();
            $('#ynh_user_name').change();
            $('#ynh_password').change();

          } else {
            throw 'content';
          }

        } catch(e) {
          switch(e) {
            case 'syntax':
              alert(_("Invalid file (syntax error):") + ' ' + _("are you sure that this is an HyperCube file?"));
            break;

            case 'content':
              alert(_("Invalid file (content error):") + ' ' + _("are you sure that this is an HyperCube file?"));
            break;

            default:
              throw e;
          }
        }
      };

      fileReader.onerror = function(e) {
        alert(_("Cannot read this file"));
      }
    }
  },

  vpnAutoClick: function() {
    $('#vpn-choice').data('auto', 'yes');
    $('#main').data('current-step', '');

    navigation.goToStep('vpn', true);
  },

  customPreinstalledChange: function() {
    if($(this).is(':checked')) {
      $('.custom-install').hide();
      $('#ig-install').hide();
      $('#ig-postinstall').show();

    } else {
      $('.custom-install').show();
      $('#ig-install').show();
      $('#ig-postinstall').hide();
    }
  },

  customInstallSdChange: function() {
    $('.installsd').hide();
    $('.unlockencryptedfs').hide();

    if($('#custom_encrypted').is(':checked')) {
      $('.unlockencryptedfs').show();

      if($('#custom_lime2').is(':checked')) {
        $('#installsd-2e').show();
      } else {
        $('#installsd-e').show();
      }
    } else {
      if($('#custom_lime2').is(':checked')) {
        $('#installsd-2').show();
      } else {
        $('#installsd-noopt').show();
      }
    }
  },

  showPwdClick: function() {
    $(this).hide();
    $(this).parent().find('.hiddenpwd').fadeIn();
  },

  showAlternativeAdminUrlsClick: function() {
    $('#showadminurls').fadeIn();
    $('#showadminalt').hide();
  },

  registrarNameClick: function() {
    var registrar = $(this).next();
    var visible = registrar.is(':visible');

    $('#registrars ol').hide();

    if(!visible) {
      registrar.fadeIn();
    }
  },

  downloadPdf: function() {
    var pdf = new jsPDF();
    var verticalOffset;
    var preinstalledImg = 'data:image/jpeg;base64,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';
    var poweroffImg = 'data:image/jpeg;base64,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';
    var chosenRegistrar = 'ovh';

    if($('#registrars').find('ol:visible').length) {
      chosenRegistrar = $('#registrars').find('ol:visible').first().parent().attr('id');
    }

    var add = function(i) {
      if($(this).is(':visible') || $(this).attr('id') == 'wifipwd' || $(this).attr('id') == 'ynhpwd' || $(this).closest('#' + chosenRegistrar).length) {
        var fontFace = 'helvetica';
        var fontSize = 9;
        var margin = 0;
        var cloneText = $(this).clone();

        cloneText.find('a').each(function() {
          if($(this).attr('href').match(/^http/) && !$(this).text().match(/^http/)) {
            $(this).text($(this).text() + ' [' + $(this).attr('href') + ']');
          }
        });

        var text = cloneText.text().trim();

        switch($(this)[0].tagName.toLowerCase()) {
          case 'h3':
            fontSize = 15;

            break;

          case 'p':
            margin = 3;

            if($(this).attr('id') == 'showwifiname') {
              text = _('- Wifi:') + ' ' + text;
              margin = 1;
            }

            if($(this).attr('id') && $(this).attr('id').match(/^showadmin/)) {
              text = _('- Address:') + ' ' + text;
              margin = 1;
            }

            break;

          case 'div':
            if($(this).attr('id') == 'wifipwd' || $(this).attr('id') == 'ynhpwd') {
              text = _('- Password:') + ' ' + text;
              margin = 1;
            }

            break;

          case 'label':
            if(text == 'On' || text == 'Off') {
              return;
            }

	    if($(this).parent().find('input[type=checkbox]').is(':checked')) {
              text += ': ' + _('YES');
            } else {
              text += ': ' + _('NO');
            }

          case 'li':
            if($(this).closest('#registrars').length) {
              if($(this).parent().attr('id') == 'registrars') {
                if($(this).attr('id') != chosenRegistrar) {
                  return;
                }

                text = text.split("\n")[0] + ':';
                margin = 3;
              } else {
                text = '  - ' + text.split("\n")[0];
              }
            } else {
              text = '- ' + text.split("\n")[0];
            }

            break;

          case 'textarea':
            text = $(this).val().trim();
            text = '    ' + text.replace(/\n/g, "\n    ");
            fontFace = 'courier';
            margin = 1;

            break;

          case 'pre':
            text = '  ' + text;
            fontFace = 'courier';
            margin = 1;

            break;
        }

        var lines = pdf.setFontSize(fontSize).splitTextToSize(text, 180);
        verticalOffset += margin;

        pdf.setFont(fontFace);
        pdf.setFontSize(fontSize);
        pdf.text(15, verticalOffset, lines);

	verticalOffset += (margin + (lines.length * 3) * (fontSize / 8));
      }
    }

    verticalOffset = 20;

    pdf.setFontSize(30);
    pdf.text(15, verticalOffset, _('Internet Cube'));
    verticalOffset += 10;

    pdf.setFontSize(20);
    pdf.text(15, verticalOffset, _('Installation'));
    verticalOffset += 12;

    $('#ig-customization').find('h3, label').each(add);
    verticalOffset += 7;

    if($('#ig-postinstall').is(':visible')) {
      $('#ig-postinstall').find('h3, p, li').each(add);
      pdf.addImage(preinstalledImg, 'JPEG', 5*15, verticalOffset + 2, 50, 39);
      verticalOffset += 52;
    }

    if($('#ig-install').is(':visible')) {
      $('#ig-install').find('h3, p, li, pre').each(add);
      verticalOffset += 7;
    }

    $('#ig-newwifi').find('h3, p, li, div#wifipwd').each(add);
    verticalOffset += 4;

    if($('#dnsconfig').is(':visible')) {
      $('#ig-dnsconfig').find('h3, p, li, textarea').each(add);
      pdf.addPage();
      verticalOffset = 20;

    } else {
      $('#ig-dnsconfig').find('h3, p').each(add);
      verticalOffset += 4;
    }

    $('#ig-selfhosting').find('h3, p, li, div#ynhpwd').each(add);
    verticalOffset += 4;

    if(!$('#dnsconfig').is(':visible')) {
      pdf.addPage();
      verticalOffset = 20;
    }

    $('#ig-security').find('h3, p').each(add);
    verticalOffset += 4;

    $('#ig-poweroff').find('h3, p').each(add);
    pdf.addImage(poweroffImg, 'JPEG', 5*15, verticalOffset + 2, 50, 39);
    verticalOffset += 52;

    $('#ig-debug').find('h3, p, li, pre').each(add);

    pdf.save(_('internetcube_installguide') + '.pdf');
  }
};

var navigation = {
  goToStep: function(step, ignoreWarns, ignoreHistory) {
    var currentStep = $('#main').data('current-step');

    ignoreWarns = (typeof ignoreWarns === 'undefined') ? false : ignoreWarns;
    ignoreHistory = (typeof ignoreHistory === 'undefined') ? false : ignoreHistory;

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

    if(currentStep == 'yunohost') {
      if(!validation.yunohost() && !ignoreWarns) {
        return false;
      }
    }

    $('#main').data('current-step', step);

    if(!ignoreHistory) {
      var historyStep = step;

      if(historyStep == 'vpn') {
        historyStep += $('#vpn-choice').data('auto') == 'yes' ? 'auto' : 'manual';
      }

      history.pushState({}, '', WEBPATH + '#' + historyStep);
    }

    if(step == 'welcome' || step == 'aboutyou' || step == 'ffdn') {
      view.hideButtonPrev();
      view.hideButtonNext();
    }

    if(step == 'vpn') {
      view.showButtonPrev('aboutyou');
      view.showButtonNext('yunohost');
    }

    if(step == 'yunohost') {
      view.showButtonPrev('vpn');
      view.showButtonNext('installation');
    }

    if(step == 'installation') {
      view.showButtonPrev('yunohost');
      view.hideButtonNext();

      controller.submitForm();
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
        view.showQuestion('preinstalled');
      } else {
        navigation.goToStep('ffdn');
      }

    } else if(question == 'question-preinstalled') {
      if($(this).data('answer') == 'yes') {
        if(!$('#custom_preinstalled').is(':checked')) {
          $('#custom_preinstalled').parent().click();
          $('#custom_preinstalled').prop('checked', true);
        }

        view.showQuestion('dotcube');
      } else {
        if($('#custom_preinstalled').is(':checked')) {
          $('#custom_preinstalled').parent().click();
          $('#custom_preinstalled').prop('checked', false);
        }

        view.showQuestion('level');
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
  },

  browserHistory: function(e) {
    var url = $(location).attr('href');
    var targetStep = url.match(/#(.*)$/);

    if(targetStep && targetStep.length > 1) {
      targetStep = targetStep[1];
    }

    if(targetStep == 'vpnmanual') {
      $('#vpn-choice').data('auto', 'no');
      targetStep = 'vpn';
    }

    if(targetStep == 'vpnauto') {
      $('#vpn-choice').data('auto', 'yes');
      targetStep = 'vpn';
    }

    switch(targetStep) {
      case 'aboutyou':
      case 'ffdn':
      case 'vpn':
      case 'yunohost':
      case 'installation':
        navigation.goToStep(targetStep, true, true);
      break;

      default:
        navigation.goToStep('welcome', true, true);
        history.pushState({}, '', WEBPATH + '#welcome');
    }
  },

  startClick: function() {
    navigation.goToStep('aboutyou');
  },

  nextButtonClick: function() {
    var nextStep = $(this).data('next-panel');
    navigation.goToStep(nextStep);
  },

  prevButtonClick: function() {
    var prevStep = $(this).data('prev-panel');
    navigation.goToStep(prevStep, true, false);
  },

  formSubmitEnterKey: function(e) {
    if(e.which == 13) {
      e.preventDefault();
      $('form').submit();
    }
  },

  formSubmit: function(e) {
    e.preventDefault();

    if($('#button-next').is(':visible')) {
      $('#button-next').click();
    }
  },

  modifyCubeFileClick: function() {
    $('#vpn-choice').data('auto', 'no');
    $('#vpn_cubefile').val('');
    $('#vpn_cubefile_edition').val('');

    navigation.goToStep('vpn', true);
  },

  loadHyperCubeClick: function() {
    if(confirm(_("Loading an existing HyperCube file will replace all values currently set.") + "\n\n" + _("Are you sure?"))) {
      $('#hypercube').click();
    }
  }
};

var validation = {
  warnings: {
    reset: function(panel) {
      var mainWarning = $('#panel-' + panel + ' .alert-danger').first();
      var warnings = $('#panel-' + panel + ' .alert-input');
      var step = panel.match(/^vpn-/) ? 'vpn' : panel;

      $('#timeline a[data-tab=' + step + ']').parent().removeClass('validated');
      $('#timeline a[data-tab=' + step + ']').parent().addClass('warnings');
      $('#panel-' + panel + ' .control-label').css('color', 'white');
      $('#panel-' + panel + ' .hasWarnings').removeClass('hasWarnings');

      mainWarning.hide();
      mainWarning.show();

      warnings.each(function() {
        $(this).closest('.form-group').remove();
      });

      if($('#button-next').is(':visible')) {
        $('#alert-next').hide();
        $('#alert-next').fadeIn();
      }
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

      warnings.hide();
      $('#' + field).closest('.form-group').before(formGroup);
      warnings.fadeIn();
    },

    none: function(panel) {
      var warnings = $('#panel-' + panel + ' .alert-danger');
      var step = panel.match(/^vpn-/) ? 'vpn' : panel;

      $('#timeline a[data-tab=' + step + ']').parent().removeClass('warnings');
      $('#timeline a[data-tab=' + step + ']').parent().addClass('validated');

      warnings.hide();
      $('#alert-next').hide();
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
    },

    testPasswordRepeat: function(fields) {
      var nbWarns = 0;

      $.each(fields, function(i, id) {
        var isWarn = false;

        if(!$('#' + id).val().trim() || !$('#' + id + '_repeat').val().trim()) {
          return;
        }

        if($('#' + id).val().trim() != $('#' + id + '_repeat').val().trim()) {
          validation.warnings.add(id + '_repeat', _("Must be the same than the previous input"));
          nbWarns++;
        }
      });

      return !nbWarns;
    }
  },

  all: function() {
    var nbWarns = 0;
    validation.warnings.reset('installation');

    $('#vpn-choice').data('auto', 'no');
    $('#vpn_cubefile').val('');
    $('#vpn_cubefile_edition').val('');

    if(!validation.aboutyou()) {
      nbWarns++;
    }

    if(!validation.vpn()) {
      nbWarns++;
    }

    if(!validation.yunohost()) {
      nbWarns++;
    }

    if(nbWarns > 0) {
      return false;
    }

    validation.warnings.none('installation');

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
    var ip4Fields = [ 'vpn_ip4_addr' ];
    var ipFields = [ 'vpn_dns0', 'vpn_dns1' ];
    var mandatoryFields = [ 'vpn_server_name', 'vpn_server_port', 'vpn_crt_server_ca_edition', 'vpn_dns0', 'vpn_dns1' ];

    if($('input[data-auth=vpn_auth_type_crt]').is(':checked')) {
      mandatoryFields.push('vpn_crt_client_edition');
      mandatoryFields.push('vpn_crt_client_key_edition');

      if($('#vpn_crt_client_edition').val() && !$('#vpn_crt_client_edition').val().match(/-----BEGIN CERTIFICATE-----/)) {
        validation.warnings.add('vpn_crt_client_edition', _("Must contain a line with <LINE>").replace('<LINE>', '-----BEGIN CERTIFICATE-----'));
        nbWarns++;
      }

      if($('#vpn_crt_client_key_edition').val() && !$('#vpn_crt_client_key_edition').val().match(/-----BEGIN PRIVATE KEY-----/)) {
        validation.warnings.add('vpn_crt_client_key_edition', _("Must contain a line with <LINE>").replace('<LINE>', '-----BEGIN PRIVATE KEY-----'));
        nbWarns++;
      }
    }

    if($('input[data-auth=vpn_auth_type_login]').is(':checked')) {
      mandatoryFields.push('vpn_login_user');
      mandatoryFields.push('vpn_login_passphrase');
      mandatoryFields.push('vpn_login_passphrase_repeat');

      if(!validation.helpers.testPasswordRepeat([ 'vpn_login_passphrase' ])) {
        nbWarns++;
      }
    }

    if($('input[data-auth=vpn_auth_type_ta]').is(':checked')) {
      mandatoryFields.push('vpn_crt_ta_edition');

      if($('#vpn_crt_ta_edition').val() && !$('#vpn_crt_ta_edition').val().match(/-----BEGIN PRIVATE KEY-----/)) {
        validation.warnings.add('vpn_crt_ta_edition', _("Must contain a line with <LINE>").replace('<LINE>', '-----BEGIN PRIVATE KEY-----'));
      }
    }

    if(!validation.helpers.testMandatoryFields(mandatoryFields)) {
      nbWarns++;
    }

    if($('#vpn_crt_server_ca_edition').val() && !$('#vpn_crt_server_ca_edition').val().match(/-----BEGIN CERTIFICATE-----/)) {
      validation.warnings.add('vpn_crt_server_ca_edition', _("Must contain a line with <LINE>").replace('<LINE>', '-----BEGIN CERTIFICATE-----'));
      nbWarns++;
    }

    if(!validation.helpers.testIpFields(ip6Fields, 6)) {
      nbWarns++;
    }

    if(!validation.helpers.testIpFields(ip4Fields, 4)) {
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

  yunohost: function() {
    var nbWarns = 0;
    validation.warnings.reset('yunohost');

    var ip6Fields = [ 'hotspot_ip6_net', 'hotspot_ip6_dns0', 'hotspot_ip6_dns1' ];
    var ip4Fields = [ 'hotspot_ip4_dns0', 'hotspot_ip4_dns1' ];
    var passwordFields = [ 'ynh_password', 'ynh_user_password', 'hotspot_wifi_passphrase', 'unix_root_password' ];

    var mandatoryFields = [ 'ynh_user', 'ynh_password', 'ynh_password_repeat', 'ynh_domain',
      'hotspot_wifi_ssid', 'hotspot_wifi_passphrase', 'hotspot_wifi_passphrase_repeat', 'ynh_user_name',
      'ynh_user_password', 'ynh_user_password_repeat', 'hotspot_ip6_dns0', 'hotspot_ip6_dns1',
      'hotspot_ip4_dns0', 'hotspot_ip4_dns1', 'hotspot_ip4_nat_prefix', 'unix_root_password',
      'unix_root_password_repeat' ];

    if(!validation.helpers.testMandatoryFields(mandatoryFields)) {
      nbWarns++;
    }

    if(!validation.helpers.testPasswordRepeat(passwordFields)) {
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
      validation.warnings.add('hotspot_wifi_passphrase', _("Only standard characters are allowed"));
      nbWarns++;
    }

    if($('#hotspot_wifi_passphrase').val().trim() && $('#hotspot_wifi_passphrase').val().trim().length < 3 || $('#hotspot_wifi_passphrase').val().trim().length > 63) {
      validation.warnings.add('hotspot_wifi_passphrase', _("Must from 8 to 63 characters (WPA2 passphrase)"));
      nbWarns++;
    }

    if($('#ynh_domain').val().trim() && !$('#ynh_domain').val().trim().match(/^[a-z0-9.-]+$/)) {
      validation.warnings.add('ynh_domain', _("Only lowercase letters, digits, dots and dashes are allowed"));
      nbWarns++;

    } else if($('.dynette').hasClass('notavailable')) {
      validation.warnings.add('ynh_domain', _("Sorry but this domain is not available"));
      nbWarns++;
    }

    if(!nbWarns) {
      validation.warnings.none('yunohost');

      return true;
    }

    return false;
  }
};


/************
 *** I18N ***
 ************/

function _(msg) {
  return i18n.translate(msg);
}

var i18n = {
  lang: 'en',
  json: {},

  detectLanguage: function() {
    var host = $(location).attr('host');

    if(host.match('\.labriqueinter\.net$')) {
      return 'fr';
    }

    return 'en';
  },

  load: function() {
    var locale = i18n.detectLanguage();

    if(locale == 'en') {
      i18n.translateHtmlStrings();

      return;
    }

    $.ajax({
      url: WEBPATH + 'i18n/' + locale + '/localization.json',

      error: function() {
        i18n.translateHtmlStrings();
        alert(url);
      },

      success: function(data) {
        i18n.lang = locale;
        i18n.json = data;

        i18n.translateHtmlStrings();
      }
    });
  },

  translateHtmlStrings: function() {
    $('[data-title]').each(function() {
      var title = $(this).data('title');
      var matches = /^\s*_\(["'](.*)["']\)\s*$/.exec(title);

      if(matches != null) {
        $(this).data('title', _(matches[1]));
      }
    });
  
    $('h1, h2, h3, h4, label, span, a, li, strong, p, em, button, .i18n').each(function() {
      if($(this).children().length == 0) {
        var text = $(this).text();
        var matches = /^\s*_\(["'](.*)["']\)\s*$/.exec(text);

        if(matches != null) {
          $(this).text(_(matches[1]));
        }
      }

      if($(this).attr('href') && $(this).attr('hreflang') != 'en') {
        var host = $(location).attr('host').replace(/.*\.([^.]+\.[^.]+)$/, '$1');
        $(this).attr('href', $(this).attr('href').replace('internetcu.be', host));
      }
    });

    $('[data-toggle="tooltip"]').tooltip();
  },

  translate: function(msg) {
    if(i18n.lang != 'en' && i18n.json[msg]) {
      var translation = i18n.json[msg][1];
      return translation ? translation : msg;
    }

    return msg;
  }
};


/************/
/*** MAIN ***/
/************/

$(document).ready(function() {
  i18n.load();
  view.setEvents();

  //view.optionalFields();
  view.fileInputSynchro();
  view.checkboxesSynchro();
  view.dynetteCheckingSynchro();
});
