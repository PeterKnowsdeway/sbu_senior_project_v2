{ pkgs }: {
  deps = [
    pkgs.redis
    pkgs.sudo
    pkgs.lsof
    pkgs.nodejs-16_x
  ];
}