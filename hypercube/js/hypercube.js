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
const WEB_PATH = '/';

const LANG_DOMAIN_EN = 'internetcu.be'
const LANG_DOMAIN_FR = 'labriqueinter.net'


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
    $('#vpn_openvpn_rm').val($.isArray(json['openvpn_rm']) ? json['openvpn_rm'].join("\n") : '');
    $('#vpn_openvpn_add').val($.isArray(json['openvpn_add']) ? json['openvpn_add'].join("\n") : '');

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
  dyndnsDomainsList: [],

  downloadDyndnsDomainsList: function() {
    $.ajax({
      url: '//dyndns.yunohost.org/domains',
      crossDomain: true,

      success: function(data) {
        hypercube.dyndnsDomainsList = data;
      }
    });
  },

  isThisDomainManagedByDyndns: function(domain) {
    var managedByDyndns = false;

    $.each(hypercube.dyndnsDomainsList, function(index, value) {
      if(domain.match('\\.' + value.replace(/[.]/g, '\\$&'))) {
        managedByDyndns = true;
      }
    });

    return managedByDyndns;
  },

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
        root_password: $('#unix_root_password').val().trim(),
        lang: i18n.lang
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
      $('#adminip6').text('https://[' + $('#vpn_ip6_net').val().trim() + '42]/yunohost/admin/');
      $('#adminip6').attr('href', 'https://[' + $('#vpn_ip6_net').val().trim() + '42]/yunohost/admin/');
      $('#showadminip6').show();
    } else {
      $('#showadminip6').hide();
    }

    if($('#vpn_ip4_addr').val().trim()) {
      $('#adminip4').text('https://' + $('#vpn_ip4_addr').val().trim() + '/yunohost/admin/');
      $('#adminip4').attr('href', 'https://' + $('#vpn_ip4_addr').val().trim() + '/yunohost/admin/');
      $('#showadminip4').show();
    } else {
      $('#showadminip4').hide();
    }

    if(hypercube.isThisDomainManagedByDyndns($('#ynh_domain').val().trim())) {
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

    $('#adminip4priv').text('https://' + $('#hotspot_ip4_nat_prefix').val().trim() + '.1/yunohost/admin/');
    $('#adminip4priv').attr('href', 'https://' + $('#hotspot_ip4_nat_prefix').val().trim() + '.1/yunohost/admin/');
    $('#admindomain').text('https://' + $('#ynh_domain').val().trim() + '/yunohost/admin/');
    $('#admindomain').attr('href', 'https://' + $('#ynh_domain').val().trim() + '/yunohost/admin/');
    $('#wifiname').text($('#hotspot_wifi_ssid').val().trim());
    $('#wifipwd').text($('#hotspot_wifi_passphrase').val().trim());
    $('#ynhpwd').text($('#ynh_password').val().trim());
    $('#userdomain').text('https://' + $('#ynh_domain').val().trim() + '/yunohost/');
    $('#userdomain').attr('href', 'https://' + $('#ynh_domain').val().trim() + '/yunohost/');
    $('#userpwd').text($('#ynh_user').val().trim() + ' / ' + $('#ynh_user_password').val().trim());
    $('.mailaddr').text($('#ynh_user').val().trim() + '@' + $('#ynh_domain').val().trim());
    $('.mailpwd').text($('#ynh_user_password').val().trim());
    $('.mailuser').text($('#ynh_user').val().trim());
    $('#mailimap').text($('#ynh_domain').val().trim());
    $('#mailsmtp').text($('#ynh_domain').val().trim());

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
    $('.ig-hidden-link').click(navigation.toggleGuideSectionClick);
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

    if($(this).val().trim().match(/^[a-z0-9.-]+$/i) && hypercube.isThisDomainManagedByDyndns($(this).val().trim())) {
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
      $('#removeusb').show();

    } else {
      $('.custom-install').show();
      $('#ig-install').show();
      $('#ig-postinstall').hide();
      $('#removeusb').hide();
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
      if($(this).is(':visible') || $(this).closest('.hiddenpwd').length || $(this).closest('#' + chosenRegistrar).length || $(this).closest('.ig-hidden').length) {
        var fontFace = 'helvetica';
        var fontSize = 9;
        var margin = 0;
        var cloneText = $(this).clone();

        cloneText.find('a').each(function() {
          if($(this).attr('href').match(/^http/) && !$(this).text().match(/^http/)) {
            $(this).text($(this).text() + ' [' + $(this).attr('href') + ']');
          }

          if($(this).closest('.showpwd').length) {
            $(this).text('');
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
            if($(this).attr('id') == 'wifipwd' || $(this).attr('id') == 'ynhpwd' || $(this).attr('id') == 'userpwd') {
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
              if($(this).parent().closest('li').length) {
                text = '  - ' + text.split("\n")[0];
              } else {
                text = '- ' + text.split("\n")[0];
              }
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

	verticalOffset += (margin + (lines.length * 3) * (fontSize / 8.1));
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
    } else {
      $('#ig-dnsconfig').find('h3, p').each(add);
    }

    pdf.addPage();
    verticalOffset = 20;

    $('#ig-selfhosting').find('h3, p, li, div#ynhpwd, div#userpwd').each(add);
    verticalOffset += 4;

    $('#ig-security').find('h3, p').each(add);
    verticalOffset += 4;

    $('#ig-poweroff').find('h3, p').each(add);
    pdf.addImage(poweroffImg, 'JPEG', 5*15, verticalOffset + 2, 50, 39);
    verticalOffset += 52;

    pdf.addPage();
    verticalOffset = 20;

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

      history.pushState({}, '', WEB_PATH + '#' + historyStep);
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

      if($(this).data('answer') == 'yes') {
        navigation.goToStep('vpn');
      } else {
        view.showQuestion('configvpn');
      }

    } else if(question == 'question-configvpn') {
      if($(this).data('answer') == 'yes') {
        navigation.goToStep('vpn');
      } else {
        navigation.goToStep('ffdn');
      }
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
        history.pushState({}, '', WEB_PATH + '#welcome');
    }
  },

  startClick: function() {
    navigation.goToStep('aboutyou');
  },

  toggleGuideSectionClick: function() {
    var div = $(this).closest('.ig-hidden');

    if(div.hasClass('ig-hidden-show')) {
      $(this).prev().addClass('glyphicon-chevron-right');
      $(this).prev().removeClass('glyphicon-chevron-down');
      div.children(':not(h3)').slideUp();
      div.removeClass('ig-hidden-show');

    } else {

      $(this).prev().addClass('glyphicon-chevron-down');
      $(this).prev().removeClass('glyphicon-chevron-right');
      div.children(':not(h3)').slideDown();
      div.addClass('ig-hidden-show');
    }
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
        var ip = $('#' + id).val().trim();
        var isWarn = false;

        ip = ip.replace(/\/[0-9]+$/, '');

        if(!ip) {
          return;
        }

        switch(ipVersion) {
          case 64:
            if(!ipaddr.isValid(ip)) {
              validation.warnings.add(id, _("This IP format looks bad"));
              isWarn = true;
            }
          break;

          case 4:
            if(!ipaddr.IPv4.isValid(ip)) {
              validation.warnings.add(id, _("This IPv4 format looks bad"));
              isWarn = true;
            }
          break;

          case 6:
            if(!ipaddr.IPv6.isValid(ip)) {
              validation.warnings.add(id, _("This IPv6 format looks bad"));
              isWarn = true;
            }
          break;
        }

        if(!isWarn) {
          $('#' + id).val(ipaddr.parse(ip).toString());
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

    if($('#ynh_user').val().trim() && !$('#ynh_user_name').val().trim().match(/ /)) {
      $('#ynh_user_name').val($('#ynh_user_name').val().trim() + ' ' + $('#ynh_user_name').val().trim());
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

    if($('#ynh_password').val().trim() && $('#ynh_password').val().trim().length < 7) {
      validation.warnings.add('ynh_password', _("Must be greater than 7 characters"));
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

    if(host.match('\\.' + LANG_DOMAIN_FR.replace(/[.]/g, '\\$&') + '$')) {
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
      url: WEB_PATH + 'i18n/' + locale + '/localization.json',

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
        $(this).attr('href', $(this).attr('href').replace(LANG_DOMAIN_EN, host));
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
  hypercube.downloadDyndnsDomainsList();
  view.setEvents();

  //view.optionalFields();
  view.fileInputSynchro();
  view.checkboxesSynchro();
  view.dynetteCheckingSynchro();
});
