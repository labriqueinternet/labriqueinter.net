#!/bin/bash

# LaBriqueInternet SD Card Installer
# Copyright (C) 2015-2016 Julien Vaubourg <julien@vaubourg.com>
# Copyright (C) 2015-2016 Emile Morel <emile@bleuchtang.fr>
# Copyright (C) 2019 Aleks
# Copyright (C) 2019 ljf
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
  echo -e "  \e[1m-g\e[0m \e[4mpath\e[0m" >&2
  echo -e "     GPG signature file for checking image integrity (.img.tar.xz.asc)" >&2
  echo -e "     \e[2mDefault with -f: Automatically filled if there is a .asc next to the image file, else no image integrity checking\e[0m" >&2
  echo -e "     \e[2mDefault without -f: Automatic download from ${url_base}\e[0m" >&2
  echo -e "  \e[1m-y\e[0m \e[4mpath\e[0m" >&2
  echo -e "     HyperCube file" >&2
  echo -e "  \e[1m-c\e[0m \e[4mpath\e[0m" >&2
  echo -e "     Include custom script to be executed at the end of system installation" >&2
  echo -e "  \e[1m-e\e[0m" >&2
  echo -e "     Install an encrypted file system" >&2
  echo -e "     \e[2mCan be automatically enabled, based on the image filename\e[0m" >&2
  echo -e "     \e[2mDefault: Clear file system\e[0m" >&2
  echo -e "  \e[1m-2\e[0m" >&2
  echo -e "     Install an image for LIME2" >&2
  echo -e "     \e[2mCan be automatically enabled, based on the image filename\e[0m" >&2
  echo -e "     \e[2mDefault: LIME\e[0m" >&2
  echo -e "  \e[1m-l\e[0m" >&2
  echo -e "     Just scan network for finding local IPv4s corresponding to Internet Cubes" >&2
  echo -e "  \e[1m-d\e[0m" >&2
  echo -e "     Enable debug messages" >&2
  echo -e "  \e[1m-h\e[0m" >&2
  echo -e "     Show this help" >&2
}

function exit_error() {
  local msg=${1}
  local usage=${2}

  if [ ! -z "${msg}" ]; then
    echo -e "\e[31m\e[1m[ERR] $1\e[0m" >&2
  fi

  if [ "${usage}" == usage ]; then
    if [ -z "${msg}" ]; then
      echo -e "\n       \e[7m\e[1m LaBriqueInternet SD Card Installer \e[0m\n"
    else
      echo
    fi

    show_usage
  fi

  exit 1
}

function exit_usage() {
  local msg=${1}

  exit_error "${msg}" usage
}

function exit_normal() {
  exit 0
}

function info() {
  local msg=${1}

  echo -e "\e[32m[INFO] ${msg}\e[0m" >&2
}

function warn() {
  local msg=${1}

  echo -e "\e[93m[WARN] ${msg}\e[0m" >&2
}

function debug() {
  local msg=${1}

  if $opt_debug; then
    echo -e "\e[33m[DEBUG] ${msg}\e[0m" >&2
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

function get_partition_path() {
  local partition_number=${1}
  local partition_path="${opt_sdcardpath}${partition_number}"

  if [[ "${opt_sdcardpath}" =~ /mmcblk[0-9]$ ]]; then
    partition_path="${opt_sdcardpath}p${partition_number}"
  fi

  echo "${partition_path}"
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
  local bins=(curl tar awk mountpoint losetup)

  if $opt_encryptedfs; then
    bins+=(cryptsetup parted mke2fs tune2fs)
  else
    bins+=(partprobe)
  fi

  if [ ! -z "${opt_gpgpath}" ]; then
    bins+=(gpg)
  fi

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
  if [[ ! -b "${opt_sdcardpath}" || ! "${opt_sdcardpath}" =~ ^/dev/(sd[a-z]|mmcblk[0-9])$ ]]; then
    exit_usage "-s should be a block device corresponding to your SD card (/dev/sd[a-z]\$ or /dev/mmcblk[0-9]\$)"
  fi

  if [ ! -z "${opt_hypercubepath}" ]; then
    if [ ! -r "${opt_hypercubepath}" ]; then
      exit_usage "File given to -y cannot be read"
    fi

    if [[ ! "$(basename "${opt_hypercubepath}")" =~ \.hypercube(\.txt)?$ ]]; then
      exit_usage "Filename given to -y must end with .hypercube or .hypercube.txt"
    fi
  fi

  if [ ! -z "${opt_gpgpath}" ]; then
    if [ ! -r "${opt_gpgpath}" ]; then
      exit_usage "File given to -g cannot be read"
    fi

    if [[ ! "${opt_gpgpath}" =~ \.img\.tar\.xz\.asc$ ]]; then
      exit_usage "Filename given to -g must end with .img.tar.xz.asc"
    fi
  fi

  if [ ! -z "${opt_imgpath}" ]; then
    if [ ! -r "${opt_imgpath}" ]; then
      exit_usage "File given to -f cannot be read"
    fi

    if [[ ! "${opt_imgpath}" =~ \.img(\.tar\.xz)?$ ]]; then
      exit_usage "Filename given to -f must end with .img or .img.tar.xz"
    fi

    if [ -z "${opt_gpgpath}" ]; then
      if [ -r "${opt_imgpath}.asc" ]; then
        info "Local GPG signature file found"
        opt_gpgpath="${opt_imgpath}.asc"
      fi
    else
      if [[ "${opt_imgpath}" =~ \.img$ ]] ; then
        exit_usage "File given to -g cannot be used for checking the file given to -f (not archive version)"
      fi

      if [ "$(basename "${opt_gpgpath}")" != "$(basename "${opt_imgpath}").asc" ] ; then
        exit_usage "Based on filenames, file given to -g seems not correspond to the file given to -f"
      fi
    fi

    if [[ "${opt_imgpath}" =~ _encryptedfs_ ]]; then
      if ! $opt_encryptedfs; then
        info "Option -e automatically set, based on the filename given to -f"
        opt_encryptedfs=true
      fi
    elif $opt_encryptedfs; then
      exit_usage "Filename given to -f does not contain _encryptedfs_ in its name, but -e was set"
    fi

    if [[ "${opt_imgpath}" =~ lime2 ]]; then
      info "Option -2 automatically set, based on the filename given to -f"
      opt_hardware="lime2"
    elif [ $opt_hardware == "lime2" ]; then
      exit_usage "Filename given to -f does not contain lime2 in its name, but -2 was set"
    fi
  fi

}


#################
### FUNCTIONS ###
#################

function cleaning_exit() {
  local status=$?
  local error=${1}

  trap - EXIT ERR INT

  if $opt_debug && [ "${status}" -ne 0 -o "${error}" == error ]; then
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

  if [ -d "${tmp_dir}" ]; then
    debug "Cleaning: removing ${tmp_dir}"
    rm -r "${tmp_dir}"
  fi
}

function cleaning_ctrlc() {
  echo && cleaning_exit error
  exit 1
}

function find_cubes() {
  local ips=()
  local addip=
  local addhost=
  local knownhosts=0
  local i=0

  local interfaces=$(sudo ip link show up | awk -F: '/state UP/ { print $2 }')

  if [ -z "${interfaces}" ]; then
    exit_error "No enabled ethernet interface found on this computer"
  fi

  debug "Interfaces found: $(echo $interfaces)"

  for i in $interfaces; do
    ips+=($(sudo arp-scan -l --interface="${i}" | grep -P '\t02' | awk '{ print $1 }'))
  done

  if [ -z "${ips}" ]; then
    exit_error "No Internet Cube found on the network :("
  fi

  echo -e "\nInternet Cubes found on the network:\n"

  for ip in "${ips[@]}"; do
    i=$(( i + 1 ))

    knownhost=$(awk "/^$ip/ { print \$2 }" /etc/hosts | head -n1)

    if [ -z "${knownhost}" ]; then
      knownhost=$ip
    else
      (( knownhosts++ )) || true
    fi

    echo -e "  ${i}. YunoHost Admin:\thttps://${knownhost}"
    echo -e "     SSH Access:\tssh root@${knownhost}"
    echo -e "     HyperCube Debug:\thttp://${knownhost}:2468/install.html\n"
  done

  if [ "${knownhosts}" -ne "${#ips[@]}" ]; then
    echo -n "Select an IP to add to your hosts file (or just press Enter): "
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

    echo -e "\n  YunoHost Admin:\thttps://${addhost}"
    echo -e "  SSH Access:\t\tssh root@${addhost}"
    echo -e "  HyperCube Debug:\thttp://${addhost}:2468/install.html\n"

#  elif [ "${knownhosts}" -eq 1 ]; then
#    echo "% ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${knownhost} 2> /dev/null"
#    echo "Press Enter to execute (or Ctrl-C to arbort)"
#    read
#
#    echo "Default Password: olinux"
#    ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no "root@${knownhost}" 2> /dev/null
#    exit_normal
  fi
}

function autodetect_sdcardpath() {
  local foundblock=;
  local confirm=no;

  if $opt_eemc; then
    debug "Search for eemc"
    root_uuid=$(sed -e 's/^.*root=//' -e 's/ .*$//' < /proc/cmdline)
    root_partition=$(blkid | tr -d '":' | grep ${root_uuid} | awk '{print $1}')
    root_partition_device="${root_partition::-2}"

    foundblock=$(ls -d -1 /dev/mmcblk* | grep -w 'mmcblk[0-9]' | grep -v "$root_partition_device");

  else

    echo -n "1. Please, remove the target SD card from your computer if present, then press Enter"
    read -s && echo
    sleep 1
  
    local blocks1=$(ls -1 /sys/block/)
  
    debug "Block devices found: $(echo $blocks1)"
  
    echo -n "2. Please, plug the target SD card into your computer (and don't touch to other devices), then press Enter"
    read -s && echo
    sleep 2
  
    local blocks2=$(ls -1 /sys/block/)
  
    debug "Block devices found: $(echo $blocks2)"
  
    for i in $blocks2; do
      if ! (echo ' '${blocks1}' ' | grep -q " ${i} ") && [ -b "/dev/${i}" ]; then
        if [ ! -z "${foundblock}" ]; then
          debug "Block devices ${foundblock} and ${i} was found"
          exit_error "Assisted Block Device Detection failed: more than 1 new block device found"
        fi
  
        foundblock="/dev/${i}"
      fi
    done
  fi

  if [ -z "${foundblock}" ]; then
    exit_error "Assisted Block Device Detection failed: no new block device found"
  else
    echo -en "\nBlock device ${foundblock} found. Use it as your SD card block device? (yes/no) "
    read confirm

    if [ "${confirm}" == yes ]; then
      opt_sdcardpath="${foundblock}"
    else
      exit_error "Aborted"
    fi
  fi
}

function umount_sdcard() {
  local partitions=$(mount | grep "^${opt_sdcardpath}" | awk '{ print $1 }')

  if [ ! -z "${partitions}" ]; then
     IFS=$'\n'

     info "Unmounting SD card partitions"

     for i in ${partitions}; do
      debug "Unmounting ${i}"

      if ! sudo umount -A "${i}" &> /dev/null; then
        exit_error "Umount of ${i} failed"
      fi
    done
  else
    debug "${opt_sdcardpath}* is not mounted"
  fi
}

function download_file() {
  local url=$1
  local dest_dir=$2

  debug "Downloading ${url}"

  if ! (cd "${dest_dir}" && curl -#fOA SdCardInstaller "${url}"); then
    return 1
  fi

  return 0
}

function download_img() {
  [ $opt_hardware == "lime2" ] && local urlpart_lime2=2
  $opt_encryptedfs && local urlpart_encryptedfs=-encryptedfs

  local tar_name="internetcube-${deb_version}-latest-lime${urlpart_lime2}${urlpart_encryptedfs}.img.tar.xz"

  info "Image file: ${tar_name}"

  if ! download_file "${url_base}${tar_name}" "${tmp_dir}"; then
    exit_error "Image download failed"
  fi

  img_path="${tmp_dir}/${tar_name}"
}

function download_gpg() {
  local gpg_name="$(basename "${img_path}").asc"

  debug "GPG signature file: ${gpg_name}"

  if ! download_file "${url_base}${gpg_name}" "${tmp_dir}"; then
    exit_error "GPG signature download failed"
  fi

  gpg_path="${tmp_dir}/${gpg_name}"
}

function check_gpg() {
  debug "Creating GnuPG directory: ${tmp_dir}/.gnupg"

  if ! gpg --homedir "${tmp_dir}/.gnupg" -qq --no-tty --no-verbose --batch --list-keys &> /dev/null; then
    exit_error "Cannot create GnuPG directory"
  fi

  debug "Requesting GPG key ${gpg_key} from HKP server ${gpg_server}"

  if ! gpg --homedir "${tmp_dir}/.gnupg" --keyserver "${gpg_server}" -q --no-tty --no-verbose --batch --keyid-format 0xlong --recv-key "${gpg_key}" &> /dev/null; then
    exit_error "GPG key download failed"
  fi

  if ! gpg --trust-model always --no-options --homedir "${tmp_dir}/.gnupg" -q --no-tty --verify "${gpg_path}" &> /dev/null; then
    exit_error "GPG signature error"
  else
    info "GPG signature successfully verified"
  fi
}

function untar_img() {
  debug "Decompressing ${img_path}"

  tar xf "${img_path}" -C "${tmp_dir}"

  # Should not have more than 1 line, but, you know...
  img_path=$(find "${tmp_dir}" -name '*.img' | head -n1)

  debug "Debian/YunoHost image is ${img_path}"

  if [ ! -r "${img_path}" ]; then
    exit_error "Decompressed image file cannot be read"
  fi
}

function copy_custom_script() {
  debug "Copying ${custom_script_path} to ${olinux_mountpoint}/usr/local/bin/hypercube_custom.sh"
  sudo install -m 755 -o root -g root "${custom_script_path}" "${olinux_mountpoint}/usr/local/bin/hypercube_custom.sh"

  debug "Flushing file system buffers"
  sudo sync
}


######################
### CORE FUNCTIONS ###
######################

function install_encrypted() {
  local partition1=$(get_partition_path 1)
  local partition2=$(get_partition_path 2)
  local board=a20lime
  local uboot=A20-OLinuXino-Lime

  mkdir -p "${files_path}" "${olinux_mountpoint}"

  [ $opt_hardware == "lime2" ] && board+=2
  [ $opt_hardware == "lime2" ] && uboot+=2

  local sunxispl_path="${olinux_mountpoint}/usr/lib/u-boot/${uboot}/u-boot-sunxi-with-spl.bin"

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
  sudo mke2fs -t ext4 -O ^metadata_csum,^64bit -q "${partition1}"

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
  sudo mke2fs -t ext4 -O ^metadata_csum,^64bit -q /dev/mapper/olinux

  debug "Mounting /dev/mapper/olinux on ${olinux_mountpoint}"
  sudo mount /dev/mapper/olinux "${olinux_mountpoint}"
  sudo mkdir "${olinux_mountpoint}/boot"

  debug "Mounting ${partition1} on ${olinux_mountpoint}/boot"
  sudo mount "${partition1}" "${olinux_mountpoint}/boot"

  loopdev=$(sudo losetup -f)
  debug "Unused loop device found: ${loopdev}"

  if [ -z "${loopdev}" ]; then
    exit_error "No unused loop device found"
  fi

  debug "Setuping loop device ${loopdev} with ${img_path}"
  sudo losetup -o 1048576 "${loopdev}" "${img_path}" &> /dev/null

  debug "Mounting ${loopdev} on ${files_path}"
  sudo mount "${loopdev}" "${files_path}"

  debug "Copying ${files_path}/* in ${olinux_mountpoint}"
  sudo cp -a ${files_path}/* "${olinux_mountpoint}"

  debug "Checking ${sunxispl_path}"

  if [ ! -f "${sunxispl_path}" ]; then
    exit_error "u-boot-sunxi-with-spl.bin unavailable"
  fi

  debug "Raw copying ${sunxispl_path} to ${opt_sdcardpath} (dd)"
  sudo dd "if=${sunxispl_path}" "of=${opt_sdcardpath}" bs=1K seek=8 conv=fsync oflag=nocache,sync &> /dev/null

  debug "Flushing file system buffers (sync)"
  sudo sync
}

function install_clear() {
  local partition1=$(get_partition_path 1)

  confirm_writing

  info "Please wait..."

  debug "Raw copying ${img_path} to ${opt_sdcardpath} (dd)"
  sudo dd if="${img_path}" of="${opt_sdcardpath}" bs=1M conv=fsync oflag=nocache,sync &> /dev/null

  debug "Flushing file system buffers"
  sudo sync

  debug "Rereading partition table of ${opt_sdcardpath}"
  sudo partprobe "${opt_sdcardpath}"

  mkdir -p "${files_path}" "${olinux_mountpoint}"

  debug "Mounting ${partition1} on ${olinux_mountpoint}"
  sudo mount "${partition1}" "${olinux_mountpoint}"
}

function copy_hypercube() {
  debug "Copying ${hypercube_path} to ${olinux_mountpoint}/root/"
  sudo cp "${hypercube_path}" "${olinux_mountpoint}/root/install.hypercube"

  debug "Flushing file system buffers"
  sudo sync
}

function replace_hypercube_sh() {
  debug "Changing ${olinux_mountpoint}/usr/local/bin/hypercube.sh by ${hypercubesh_path}"
  if [ ! -f ${hypercubesh_path} ]; then
     local hypercubesh_repo="https://raw.githubusercontent.com/labriqueinternet/build.labriqueinter.net/master/build/script/hypercube/hypercube.sh"
     pushd $(basename ${hypercubesh_path})
     curl -#fOA hypercube.sh  $hypercubesh_repo
     popd
  fi

  sudo cp "${hypercubesh_path}" "${olinux_mountpoint}/usr/local/bin/hypercube.sh"

  debug "Flushing file system buffers"
  sudo sync
}

function patch_servicesyml() {
    local servicesyml="${olinux_mountpoint}/etc/yunohost/services.yml"
    if ! grep -q "need_lock" "${servicesyml}";
    then
        info "Patching services.yml"
        sudo sed -i "s/yunohost-firewall:/yunohost-firewall:\n   need_lock: true/g" ${servicesyml}
    fi
}

########################
### GLOBAL VARIABLES ###
########################

url_base=https://repo.labriqueinter.net/
gpg_key=0xCD8F4D648AC0ECC1
gpg_server=keyserver.ubuntu.com
deb_version=stretch
opt_encryptedfs=false
opt_findcubes=false
opt_debug=false
opt_hardware="lime1"
tmp_dir=$(mktemp -dp . .install-sd.sh_tmpXXXXXX)
olinux_mountpoint="${tmp_dir}/olinux_mountpoint"
files_path="${tmp_dir}/files"
img_path=
loopdev=


##############
### SCRIPT ###
##############

trap cleaning_exit EXIT ERR
trap cleaning_ctrlc INT

while getopts "s:mf:g:c:y:w:em2pldh" opt; do
  case $opt in
    s) opt_sdcardpath=$OPTARG ;;
    f) opt_imgpath=$OPTARG ;;
    g) opt_gpgpath=$OPTARG ;;
    y) opt_hypercubepath=$OPTARG ;;
    w) opt_hypercubeshpath=$OPTARG ;;
    c) opt_customscriptpath=$OPTARG ;;
    m) opt_emmc=true ;;
    e) opt_encryptedfs=true ;;
    2) opt_hardware="lime2" ;;
    p) opt_hardware="pcplus" ;;
    l) opt_findcubes=true ;;
    d) opt_debug=true ;;
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

umount_sdcard

img_path=$opt_imgpath
gpg_path=$opt_gpgpath
hypercube_path=$opt_hypercubepath
hypercubesh_path=$opt_hypercubeshpath
custom_script_path=$opt_customscriptpath

if [ -z "${img_path}" ]; then
  info "Downloading Debian/YunoHost image (HTTPS)"
  download_img

  if [ -z "${gpg_path}" ]; then
    info "Downloading GPG signature (HTTPS)"
    download_gpg
  fi
fi

if [ ! -z "${gpg_path}" ]; then
  info "Checking GPG signature"
  check_gpg
fi

if [ -z "${gpg_path}" ]; then
  warn "Not checking image integrity"
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

patch_servicesyml

if [ ! -z "${hypercube_path}" ]; then
  info "Copying HyperCube file"
  copy_hypercube
fi

if [ ! -z "${hypercubesh_path}" ]; then
  info "Replacing HyperCube script"
  replace_hypercube_sh
fi

if [ ! -z "${custom_script_path}" ]; then
  info "Copying custom script"
  copy_custom_script
fi

info "Done"
