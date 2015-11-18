#Назначьте этой переменной то имя которое вы используете для флотов-столбиков
#Достаточно начала имени флотов, т.е. 'Занят' будет работать с флотами
#Занят, Занято, Занято!, Занята!, Занята для меня и т.д.
my $CheckedFleetName = 'BusyPlanet%';

$Empire->fake(0);

my @Log;
my @LogCount = (0,0,0);

foreach $Fleet($Empire->fleets()->getFleetsByName($CheckedFleetName.'%')) {
#Не обрабатываем летающие флоты
   if($Fleet->getProp('turns_till_arrival')) { next; }
   #Проверяем планету на которой находится флот
   my $result = CheckPlanet($Fleet->getProp('x'), $Fleet->getProp('y'));
   if($result!="") { @LogCount[$result]++; }
}

$Empire->clearLog();

#Сортируем полученный список
@Log = sort { my @prio = (1,2,0); @prio[$a->[0]] cmp @prio[$b->[0]]; } @Log;

#Распечатка результатов работы
for (@Log) {
	$Empire->log($_->[0], $_->[1]);
}

$la = @LogCount[2];
$lw = @LogCount[0];
$ln = @LogCount[1];

if($la+$lw+$ln) {
   $Empire->message("Заняли планету под столбиком: $la тревог, $lw предупреждений, $ln оповещений");
}

sub CheckPlanet {
   my ($x, $y) = @_;
   my $Planet = $Empire->planets()->get($x, $y);

   my $owner_id = $Planet->getProp('owner_id');
   my $owner_name = $Planet->getProp('owner_name');
   my $player_id = $Empire->getProp('player_id');

   if($owner_id && $owner_id!=$Empire->getProp('player_id')) {
      my $dip = "";
      my $status = 0;
      my $dip_code = $Empire->dipRelation($owner_id);

      my @dip_mass = ("враждебным", "не установленным", "дружественным", "вассалом", "лордом");
      my @status_mass = (2, 2, 0, 1, 1);

      if(!defined($dip_code)) { $dip="неизвестным вам"; $status = 2; }
      else { $dip=@dip_mass[$dip_code]; $status = @status_mass[$dip_code]; }

      my $result="Застолбленная планета [$x:$y] была занята $dip игроком $owner_name (ID:$owner_id)";

      push(@Log, [$status,$result] );
      return $status;
   }
   return "";
}
