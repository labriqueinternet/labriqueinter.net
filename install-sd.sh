#!/bin/bash

# LaBriqueInternet SD Card Installer
# Copyright (C) 2015 Julien Vaubourg <julien@vaubourg.com>
# Copyright (C) 2015 Emile Morel <emile@bleuchtang.fr>
# Contribute at https://github.com/labriqueinternet/labriqueinter.net
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

set -e


###############
### HELPERS ###
###############

function preamble() {
  local confirm=no

  echo -ne "\e[91m"
  echo "THERE IS NO WARRANTY FOR THIS PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW."
  echo "EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER"
  echo "PARTIES PROVIDE THE PROGRAM \"AS IS\" WITHOUT WARRANTY OF ANY KIND, EITHER"
  echo "EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF"
  echo "MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE RISK AS TO THE"
  echo "QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU. SHOULD THE PROGRAM PROVE"
  echo "DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING, REPAIR OR CORRECTION."
  echo "CHOOSING A WRONG BLOCK DEVICE CAN MAKE YOU LOSE PERSONAL DATA. BE CAREFUL!"
  echo -e "\e[39m"

  echo -n "Continue? (yes/no) "
  read confirm && echo

  if [ "${confirm}" != yes ]; then
    exit_error "Aborted"
  fi
}

function show_usage() {
  echo -e "\e[1mOPTIONS\e[0m" >&2
  echo -e "  \e[1m-s\e[0m \e[4mpath\e[0m" >&2
  echo -e "     Target SD card block device (e.g. /dev/sdb, /dev/mmcblk0)" >&2
  echo -e "     \e[2mDefault: Assisted Block Device Detection\e[0m" >&2
  echo -e "  \e[1m-f\e[0m \e[4mpath\e[0m" >&2
  echo -e "     Debian/YunoHost image file (.img or .img.tar.xz)" >&2
  echo -e "     \e[2mDefault: Automatic download from ${url_base}\e[0m" >&2
  echo -e "  \e[1m-c\e[0m \e[4mpath\e[0m" >&2
  echo -e "     MD5 checksums file (e.g. MD5SUMS)" >&2
  echo -e "     \e[2mDefault: Automatic download from ${url_base} if no -f, or no checksum checking\e[0m" >&2
  echo -e "  \e[1m-e\e[0m" >&2
  echo -e "     Install an encrypted file system" >&2
  echo -e "     \e[2mDefault: Clear file system\e[0m" >&2
  echo -e "  \e[1m-2\e[0m" >&2
  echo -e "     Install an image for LIME2" >&2
  echo -e "     \e[2mDefault: LIME\e[0m" >&2
  echo -e "  \e[1m-l\e[0m" >&2
  echo -e "     Just scan network for finding local IPv4s corresponding to Internet Cubes" >&2
  echo -e "  \e[1m-d\e[0m" >&2
  echo -e "     Enable debug messages" >&2
  echo -e "  \e[1m-h\e[0m" >&2
  echo -e "     Show this help" >&2
}

function exit_error() {
  if [ ! -z "${1}" ]; then
    echo -e "\e[31m\e[1m[ERR] $1\e[0m" >&2
  fi

  if [ "${2}" == usage ]; then
    if [ -z "${1}" ]; then
      echo -e "\n       \e[7m\e[1m LaBriqueInternet SD Card Installer \e[0m\n"
    else
      echo
    fi

    show_usage
  fi

  exit 1
}

function exit_usage() {
  exit_error "${1}" usage
}

function exit_normal() {
  exit 0
}

function info() {
  echo -e "\e[32m[INFO] ${1}\e[0m" >&2
}

function debug() {
  if $opt_debug; then
    echo -e "\e[33m[DEBUG] ${1}\e[0m" >&2
  fi
}

function confirm_writing() {
  local confirm=

  echo -en "\e[93m\e[1mWARNING:\e[0m Data on ${opt_sdcardpath} will be lost. Confirm? (yes/no) "
  read confirm

  if [ "${confirm}" != yes ]; then
    exit_error "Aborted"
  fi
}


##########################
### CHECKING FUNCTIONS ###
##########################

function check_sudo() {
  if ! which sudo &> /dev/null; then
    exit_error "sudo command is required"
  fi

  info "This script needs a sudo access"

  if ! sudo echo &> /dev/null; then
    exit_error "sudo password is required"
  fi
}

function check_bins() {
  local bins=(curl tar awk md5sum mountpoint cryptsetup parted mke2fs tune2fs losetup)

  for i in "${bins[@]}"; do
    if ! sudo which "${i}" &> /dev/null; then
      exit_error "${i} command is required"
    fi
  done
}

function check_findcubes_bins() {
  local bins=(arp-scan awk)

  for i in "${bins[@]}"; do
    if ! sudo which "${i}" &> /dev/null; then
      exit_error "${i} command is required"
    fi
  done
}

function check_args() {
  if [[ ! -b "${opt_sdcardpath}" || ! ( "${opt_sdcardpath}" =~ ^/dev/sd[a-z]$ ||  "${opt_sdcardpath}" =~ ^/dev/mmcblk[0-9]$ ) ]]; then
    exit_usage "-s should be a block device corresponding to your SD card (/dev/sd[a-z]\$ or /dev/mmcblk[0-9]\$)"
  fi
  
  if [ ! -z "${opt_md5path}" -a ! -r "${opt_md5path}" ]; then
    exit_usage "File given to -c cannot be read"
  fi

  if [ -z "${opt_lime2}" ]; then
    info "No option -2 specified, installing for LIME by default"
    opt_lime2=false
  fi
  
  if [[ ! -z "${opt_imgpath}" ]]; then
    if [ ! -r "${opt_imgpath}" ]; then
      exit_usage "File given to -f cannot be read"
    fi

    if [[ ! "${opt_imgpath}" =~ .img$ && ! "${opt_imgpath}" =~ .img.tar.xz$ ]]; then
      exit_usage "Filename given to -f must end by .img or .img.tar.xz"
    fi
  
    if [[ "${opt_imgpath}" =~ _encryptedfs_ ]]; then
      info "Option -e automatically set, based on the filename given to -f"
      opt_encryptedfs=true
  
    elif $opt_encryptedfs; then
      exit_usage "Filename given to -f does not contain _encryptedfs_ in its name, but -e was set"
    fi
  
    if [[ "${opt_imgpath}" =~ LIME2 ]]; then
      info "Option -2 automatically set, based on the filename given to -f"
      opt_lime2=true
  
    elif $opt_lime2; then
      exit_usage "Filename given to -f does not contain LIME2 in its name, but -2 was set"
    fi
  fi
}


#################
### FUNCTIONS ###
#################

function cleaning_exit() {
  status=$?
  trap INT

  if $opt_debug && [ "${status}" -ne 0 -o "${1}" == error ]; then
    debug "There was an error, press Enter for doing cleaning"
    read -s
  fi

  local mountpoints=("${olinux_mountpoint}/boot" "${olinux_mountpoint}" "${files_path}")

  for i in "${mountpoints[@]}"; do
    if mountpoint -q "${i}"; then
      debug "Cleaning: umounting ${i}"
      sudo umount "${i}"
    fi
  done

  if [ ! -z "${loopdev}" ] && sudo losetup "${loopdev}" &> /dev/null; then
    debug "Cleaning: detaching loop device ${loopdev}"
    sudo losetup -d "${loopdev}"
  fi

  if [ -b /dev/mapper/olinux ]; then
    debug "Cleaning: closing /dev/mapper/olinux luks device"
    sudo cryptsetup luksClose olinux 
  fi

  if [ ! -z "${tmp_dir}" ]; then
    debug "Cleaning: removing ${tmp_dir}"
    rm -r "${tmp_dir}"
  fi
}

function cleaning_ctrlc() {
  trap EXIT
  echo && cleaning_exit error
  exit 1
}

function find_cubes() {
  local ips=$(sudo arp-scan --local | grep -P '\t02' | awk '{ print $1 }')
  local addip=
  local addhost=
  local i=0

  if [ -z "${ips}" ]; then
    exit_error "No Internet Cube found on the network :("
  fi

  echo -e "\nInternet Cubes found on the network:\n"
  ips=($ips)

  for ip in "${ips[@]}"; do
    i=$(( i + 1 ))

    knownhost=$(awk "/$ip/ { print \$2 }" /etc/hosts | head -n1)
    [ -z "${knownhost}" ] && knownhost=$ip

    echo -e "  ${i}. ${ip} | ssh root@${knownhost} | https://${knownhost}"
  done

  echo -en "\nSelect an IP to add to your hosts file (just press Enter if not necessary): "
  read addip

  if [ -z "${addip}" ]; then
    exit_normal
  fi

  if [[ "${addip}" =~ ^[0-9]+$ ]]; then
    addip=${ips[$(( addip - 1 ))]}

    if [ -z "${addip}" ]; then
      exit_error "IP index not found"
    fi
  fi

  if [[ ! "${addip}" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    exit_error "This is not an IPv4 nor an IP index"
  fi

  echo -en "Choose a host name for this IP: "
  read addhost

  echo -e "${addip}\t${addhost}" | sudo tee -a /etc/hosts > /dev/null

  info "IP successfully added to your hosts file"
  echo -e "\n  ssh root@${addhost} | https://${addhost}\n"
}

function autodetect_sdcardpath() {
  echo -n "1. Please, remove the target SD card from your computer if present, then press Enter"
  read -s && echo
  sleep 1

  local blocks1=$(ls -1 /sys/block/)

  debug "Block devices found: $(echo $blocks1)"

  echo -n "2. Please, plug the target SD card into your computer (and don't touch to other devices), then press Enter"
  read -s && echo
  sleep 2

  local blocks2=$(ls -1 /sys/block/)
  local foundblock=;
  local confirm=no;

  debug "Block devices found: $(echo $blocks2)"

  for i in $blocks2; do
    if ! (echo ' '${blocks1}' ' | grep -q " ${i} ") && [ -b "/dev/${i}" ]; then
      if [ ! -z "${foundblock}" ]; then
        debug "Block devices ${foundblock} and ${i} was found"
        exit_error "Assisted Block Device Detection failed: more than 1 new block device found"
      fi

      foundblock="${i}"
    fi
  done

  if [ -z "${foundblock}" ]; then
    exit_error "Assisted Block Device Detection failed: no new block device found"
  else
    echo -en "\nBlock device /dev/${foundblock} found. Use it as your SD card block device? (yes/no) "
    read confirm

    if [ "${confirm}" == yes ]; then
      opt_sdcardpath="/dev/${foundblock}"
    else
      exit_error "Aborted"
    fi
  fi
}

function download_img() {
  $opt_lime2 && local urlpart_lime2=2
  $opt_encryptedfs && local urlpart_encryptedfs=_encryptedfs
  
  local tar_name="labriqueinternet_A20LIME${urlpart_lime2}${urlpart_encryptedfs}_latest_${deb_version}.img.tar.xz"

  info "Image file: ${tar_name}"

  if ! download_file "${url_base}${tar_name}" "${tmp_dir}"; then
    exit_error "Image download failed"
  fi

  img_path="${tmp_dir}/${tar_name}"
}

function untar_img() {
  debug "Decompressing ${img_path}"

  tar xf "${img_path}" -C "${tmp_dir}"

  # Should not have more than 1 line, but, you know...
  img_path=$(find "${tmp_dir}" -name *.img | head -n1) 

  debug "Debian/YunoHost image is ${img_path}"

  if [ ! -r "${img_path}" ]; then
    exit_error "Decompressed image file cannot be read"
  fi
}

function download_md5() {
  if ! download_file "${url_base}MD5SUMS" "${tmp_dir}"; then
    exit_error "MD5SUMS file download failed"
  fi

  md5_path="${tmp_dir}/MD5SUMS"
}

function check_md5() {
  local filename=${img_path##*/}
  local digest=$(awk "/${filename}\$/ { print \$1 }" "${md5_path}" | head -n1)

  debug "MD5 message digest found: ${digest}"
  debug "Computing MD5 message digest"

  local compareTo=$(md5sum ${img_path} | awk '{ print $1 }')

  debug "MD5 message digest computed: ${compareTo}"

  if [ "${digest}" != "${compareTo}" ]; then
    if [[ "${filename}" =~ .tar.xz$ ]]; then
      exit_error "Checksum error"
    else
      exit_error "Checksum error (maybe the file should be an archive)"
    fi
  else
    info "MD5 message digest successfully verified"
  fi
}

function download_file() {
  local url=$1
  local dest_dir=$2

  if [ ! -f "${tmp_dir}/cacert_root.crt" ]; then
  cat << EOF > "${tmp_dir}/cacert_root.crt"
-----BEGIN CERTIFICATE-----
MIIHPTCCBSWgAwIBAgIBADANBgkqhkiG9w0BAQQFADB5MRAwDgYDVQQKEwdSb290
IENBMR4wHAYDVQQLExVodHRwOi8vd3d3LmNhY2VydC5vcmcxIjAgBgNVBAMTGUNB
IENlcnQgU2lnbmluZyBBdXRob3JpdHkxITAfBgkqhkiG9w0BCQEWEnN1cHBvcnRA
Y2FjZXJ0Lm9yZzAeFw0wMzAzMzAxMjI5NDlaFw0zMzAzMjkxMjI5NDlaMHkxEDAO
BgNVBAoTB1Jvb3QgQ0ExHjAcBgNVBAsTFWh0dHA6Ly93d3cuY2FjZXJ0Lm9yZzEi
MCAGA1UEAxMZQ0EgQ2VydCBTaWduaW5nIEF1dGhvcml0eTEhMB8GCSqGSIb3DQEJ
ARYSc3VwcG9ydEBjYWNlcnQub3JnMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC
CgKCAgEAziLA4kZ97DYoB1CW8qAzQIxL8TtmPzHlawI229Z89vGIj053NgVBlfkJ
8BLPRoZzYLdufujAWGSuzbCtRRcMY/pnCujW0r8+55jE8Ez64AO7NV1sId6eINm6
zWYyN3L69wj1x81YyY7nDl7qPv4coRQKFWyGhFtkZip6qUtTefWIonvuLwphK42y
fk1WpRPs6tqSnqxEQR5YYGUFZvjARL3LlPdCfgv3ZWiYUQXw8wWRBB0bF4LsyFe7
w2t6iPGwcswlWyCR7BYCEo8y6RcYSNDHBS4CMEK4JZwFaz+qOqfrU0j36NK2B5jc
G8Y0f3/JHIJ6BVgrCFvzOKKrF11myZjXnhCLotLddJr3cQxyYN/Nb5gznZY0dj4k
epKwDpUeb+agRThHqtdB7Uq3EvbXG4OKDy7YCbZZ16oE/9KTfWgu3YtLq1i6L43q
laegw1SJpfvbi1EinbLDvhG+LJGGi5Z4rSDTii8aP8bQUWWHIbEZAWV/RRyH9XzQ
QUxPKZgh/TMfdQwEUfoZd9vUFBzugcMd9Zi3aQaRIt0AUMyBMawSB3s42mhb5ivU
fslfrejrckzzAeVLIL+aplfKkQABi6F1ITe1Yw1nPkZPcCBnzsXWWdsC4PDSy826
YreQQejdIOQpvGQpQsgi3Hia/0PsmBsJUUtaWsJx8cTLc6nloQsCAwEAAaOCAc4w
ggHKMB0GA1UdDgQWBBQWtTIb1Mfz4OaO873SsDrusjkY0TCBowYDVR0jBIGbMIGY
gBQWtTIb1Mfz4OaO873SsDrusjkY0aF9pHsweTEQMA4GA1UEChMHUm9vdCBDQTEe
MBwGA1UECxMVaHR0cDovL3d3dy5jYWNlcnQub3JnMSIwIAYDVQQDExlDQSBDZXJ0
IFNpZ25pbmcgQXV0aG9yaXR5MSEwHwYJKoZIhvcNAQkBFhJzdXBwb3J0QGNhY2Vy
dC5vcmeCAQAwDwYDVR0TAQH/BAUwAwEB/zAyBgNVHR8EKzApMCegJaAjhiFodHRw
czovL3d3dy5jYWNlcnQub3JnL3Jldm9rZS5jcmwwMAYJYIZIAYb4QgEEBCMWIWh0
dHBzOi8vd3d3LmNhY2VydC5vcmcvcmV2b2tlLmNybDA0BglghkgBhvhCAQgEJxYl
aHR0cDovL3d3dy5jYWNlcnQub3JnL2luZGV4LnBocD9pZD0xMDBWBglghkgBhvhC
AQ0ESRZHVG8gZ2V0IHlvdXIgb3duIGNlcnRpZmljYXRlIGZvciBGUkVFIGhlYWQg
b3ZlciB0byBodHRwOi8vd3d3LmNhY2VydC5vcmcwDQYJKoZIhvcNAQEEBQADggIB
ACjH7pyCArpcgBLKNQodgW+JapnM8mgPf6fhjViVPr3yBsOQWqy1YPaZQwGjiHCc
nWKdpIevZ1gNMDY75q1I08t0AoZxPuIrA2jxNGJARjtT6ij0rPtmlVOKTV39O9lg
18p5aTuxZZKmxoGCXJzN600BiqXfEVWqFcofN8CCmHBh22p8lqOOLlQ+TyGpkO/c
gr/c6EWtTZBzCDyUZbAEmXZ/4rzCahWqlwQ3JNgelE5tDlG+1sSPypZt90Pf6DBl
Jzt7u0NDY8RD97LsaMzhGY4i+5jhe1o+ATc7iwiwovOVThrLm82asduycPAtStvY
sONvRUgzEv/+PDIqVPfE94rwiCPCR/5kenHA0R6mY7AHfqQv0wGP3J8rtsYIqQ+T
SCX8Ev2fQtzzxD72V7DX3WnRBnc0CkvSyqD/HMaMyRa+xMwyN2hzXwj7UfdJUzYF
CpUCTPJ5GhD22Dp1nPMd8aINcGeGG7MW9S/lpOt5hvk9C8JzC6WZrG/8Z7jlLwum
GCSNe9FINSkYQKyTYOGWhlC0elnYjyELn8+CkcY7v2vcB5G5l1YjqrZslMZIBjzk
zk6q5PYvCdxTby78dOs6Y5nCpqyJvKeyRKANihDjbPIky/qbn3BHLt4Ui9SyIAmW
omTxJBzcoTWcFbLUvFUufQb1nA5V9FrWk9p2rSVzTMVD
-----END CERTIFICATE-----
EOF
  fi

  debug "Downloading ${url}"

  if ! (cd "${dest_dir}" && curl -#fOA SdCardInstaller --cacert "${tmp_dir}/cacert_root.crt" "${url}"); then
    return 1
  fi

  return 0
}


######################
### CORE FUNCTIONS ###
######################

function install_encrypted() {
  local partition1="${opt_sdcardpath}1"
  local partition2="${opt_sdcardpath}2"
  local board=a20lime
  local uboot=A20-OLinuXino-Lime

  mkdir "${files_path}" "${olinux_mountpoint}"

  $opt_lime2 && board+=2
  $opt_lime2 && uboot+=2

  local sunxispl_path="${olinux_mountpoint}/usr/lib/u-boot/${uboot}/u-boot-sunxi-with-spl.bin"

  if [[ "${opt_sdcardpath}" =~ /mmcblk[0-9]$ ]]; then
    partition1="${opt_sdcardpath}p1"
    partition2="${opt_sdcardpath}p2"
  fi

  confirm_writing

  info "Please wait..."
  debug "Partitioning ${opt_sdcardpath}"

  sudo parted --script "${opt_sdcardpath}" mklabel msdos
  sudo parted --script "${opt_sdcardpath}" mkpart primary ext4 2048s 512MB
  sudo parted --script "${opt_sdcardpath}" mkpart primary ext4 512MB 100%
  sudo parted --script "${opt_sdcardpath}" align-check optimal 1

  debug "Expected partition names: ${partition1} and ${partition2}"

  if [ ! -b "${partition1}" -o ! -b "${partition2}" ]; then
    exit_error "Unable to detect created partitions"
  fi

  debug "Installing ext4 on ${partition1}"
  sudo mke2fs -t ext4 -q "${partition1}"

  debug "Adjusting tunable filesystem parameters on ${partition1} (tune2fs)"
  sudo tune2fs -o journal_data_writeback "${partition1}" &> /dev/null

  local passphrase1=
  local passphrase2=
  local is_passphrase_ok=false

  while ! $is_passphrase_ok; do
    echo -n "Passphrase for your encrypted disk (should be strong): "
    read -s passphrase1 && echo
  
    if [ -z "${passphrase1}" ]; then
      echo "You have to choose a passphrase!" >&2
      continue
    fi
  
    echo -n "Confirm passphrase: "
    read -s passphrase2 && echo
  
    if [ "${passphrase1}" != "${passphrase2}" ]; then
      echo "Passphrases mismatch :(" >&2
      continue
    fi

    is_passphrase_ok=true
  done

  info "Installing encrypted SD card (this could take a few minutes)"

  debug "Encrypting partition ${partition2}"
  echo -n "${passphrase1}" | sudo cryptsetup --key-file - luksFormat "${partition2}"

  debug "Opening encrypted partition ${partition2} on /dev/mapper/olinux"
  echo -n "${passphrase1}" | sudo cryptsetup --key-file - luksOpen "${partition2}" olinux

  if [ ! -b /dev/mapper/olinux ]; then
    exit_error "Partition decryption failed"
  fi

  debug "Installing ext4 on /dev/mapper/olinux"
  sudo mke2fs -t ext4 -q /dev/mapper/olinux

  debug "Mounting /dev/mapper/olinux on ${olinux_mountpoint}"
  sudo mount -t ext4 /dev/mapper/olinux "${olinux_mountpoint}"
  sudo mkdir "${olinux_mountpoint}/boot"

  debug "Mounting ${partition1} on ${olinux_mountpoint}/boot"
  sudo mount -t ext4 "${partition1}" "${olinux_mountpoint}/boot"

  loopdev=$(sudo losetup -f)
  debug "Unused loop device found: ${loopdev}"

  if [ -z "${loopdev}" ]; then
    exit_error "No unused loop device found"
  fi

  debug "Setuping loop device ${loopdev} with ${img_path}"
  sudo losetup -o 1048576 "${loopdev}" "${img_path}"

  debug "Mounting ${loopdev} on ${files_path}"
  sudo mount "${loopdev}" "${files_path}"

  debug "Copying ${files_path}/* in ${olinux_mountpoint}"
  sudo cp -a ${files_path}/* "${olinux_mountpoint}"

  debug "Checking ${sunxispl_path}"

  if [ ! -f "${sunxispl_path}" ]; then
    exit_error "u-boot-sunxi-with-spl.bin unavailable"
  fi

  debug "Raw copying ${sunxispl_path} to ${opt_sdcardpath} (dd)"
  sudo dd "if=${sunxispl_path}" "of=${opt_sdcardpath}" bs=1024 seek=8 &> /dev/null

  debug "Flushing file system buffers (sync)"
  sudo sync
}

function install_clear() {
  confirm_writing

  info "Please wait..."

  debug "Raw copying ${img_path} to ${opt_sdcardpath} (dd)"
  sudo dd "if=${img_path}" of="${opt_sdcardpath}" bs=1M &> /dev/null

  debug "Flushing file system buffers (sync)"
  sudo sync
}


########################
### GLOBAL VARIABLES ###
########################

url_base=https://repo.labriqueinter.net/
deb_version=jessie
opt_encryptedfs=false
opt_debug=false
opt_findcubes=false
opt_lime2=
tmp_dir=$(mktemp -dp /tmp/ labriqueinternet-installsd-XXXXX)
olinux_mountpoint="${tmp_dir}/olinux_mountpoint"
files_path="${tmp_dir}/files"
img_path=
loopdev=


##############
### SCRIPT ###
##############

trap cleaning_exit EXIT
trap cleaning_exit ERR
trap cleaning_ctrlc INT

while getopts "f:s:c:e2dlh" opt; do
  case $opt in
    f) opt_imgpath=$OPTARG ;;
    c) opt_md5path=$OPTARG ;;
    s) opt_sdcardpath=$OPTARG ;;
    e) opt_encryptedfs=true ;;
    2) opt_lime2=true ;;
    d) opt_debug=true ;;
    l) opt_findcubes=true ;;
    h) exit_usage ;;
    \?) exit_usage ;;
  esac
done

if $opt_findcubes; then
  info "Scanning network for finding awake connected Internet Cubes"

  check_sudo
  check_findcubes_bins
  find_cubes

  exit_normal
fi

preamble

if [ -z "${opt_sdcardpath}" ]; then
  info "Option -s was not set, starting Assisted Block Device Detection"
  autodetect_sdcardpath

  if [ ! -z "${opt_sdcardpath}" ]; then
    info "Option -s was set to ${opt_sdcardpath}"
  fi
fi

check_sudo
check_args
check_bins

img_path=$opt_imgpath
md5_path=$opt_md5path

if [ -z "${img_path}" ]; then
  info "Downloading Debian/YunoHost image (HTTPS)"
  download_img

  if [ -z "${md5_path}" ]; then
    info "Downloading MD5SUMS (HTTPS)"
    download_md5
  fi
fi

if [ ! -z "${md5_path}" ]; then
  info "Checking MD5 message digest"
  check_md5
else
  info "Not checking MD5 message digest"
fi

if [[ "${img_path}" =~ .img.tar.xz$ ]]; then
  info "Decompressing Debian/YunoHost image"
  untar_img
fi

if $opt_encryptedfs; then
  info "Configuring encrypted SD card"
  install_encrypted
else
  info "Installing SD card (this could take a few minutes)"
  install_clear
fi

info "Done"

exit_normal
