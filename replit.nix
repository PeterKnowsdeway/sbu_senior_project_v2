{ pkgs }: {
  deps = [
    pkgs.redis
    pkgs.lsof
    pkgs.nodejs-16_x
  ];
}