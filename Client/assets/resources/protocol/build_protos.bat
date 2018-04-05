cd /d %~dp0

protoc --go_out=..\..\protocal\connect  connect.proto
protoc --go_out=..\..\protocal\game  game.proto

pause