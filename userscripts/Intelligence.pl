#################################################################
## Версия от 29.03.2010
## FieldFiller By Нептун 3
## Засевалка зондополей
## Заменил NRoute на RouteFor - Colisa Lalia
## Поправил включение невидимости - Colisa Lalia
## +Правки vGimly :)
## Добавил поиск планет с верфями в районе засеивания
## Добавил поиск "зависших" флотов
## Добавил использование старых зондополей
## Добавил неизвестное количество новых глюков :)
## Добавил средства поиска этих самых глюков
## Снова поправил включение невидимости
## +Неспрятавшиеся флоты теперь снова попытаются спрятаться
## Rolling:
## поведение меняется на не-лезть для тех кому руками поставили атаку
#################################################################

#################################################################
## Берет из указанных гарнизонов зонды и засевает в указанном районе
## отправляет зонды только туда, где нет других флотов.
## После прилета зонда на место, маршрутизатор удаляет переменную, и скрипт далее следит
## только за фактом наличия флота на планете.
## т.е. можно забрать зонд из поля для других нужд, не пересоздавая флот.
## и скрипт пошлет на его место другой зонд.
#################################################################

###################    Настройки скрипта   ##############################
## Список планет откуда таскать зонды - оставьте пустым чтобы нашлись сами
## Если хотите чтобы зонды строились - следите чтобы на планетах были верфи (и запчасти)
#my @planets = qw();

# Например:
my @planets = qw(PLANETS);

## Координаты засеваемого района
my ($left,$top, $right,$bottom)=qw(COORDINATS);

my %params=(
## Расстояние от центра района засеивания до своих планет, где ищутся верфи и зонды
## Только если список @planets пустой - иначе игнорируется.
MaxMyDist => 40,

## Идентификатор прототипа "семечек" (=0 если надо искать по названию)
ProbeID => 0,

## ИЛИ его название (используется только если ProbeID закомментарен или = 0)
ProbeName => 'FLEET_PROTOTYPE',

## Внутреннее имя флота
FleetName => 'FLEET_NAME',

## Внешнее имя флота (если пустой или закомментарен - Fleet)
FleetExtName => 'FLEET_EXT_NAME',

## на кого шарить зонды и тип шары
## если пустая строка или закомментарена - не будет шарить
PlayerNames => '',
Mode => 1,

## Требуется ли включение невидимости 1-включать, 0 - не включать
## Ничего страшного не случится, если флот не умеет включать невидимость а вы попробуете его спрятать.
## В случае если SetUnvisible=1 и HungOff>0 - все неспрятавшиеся флоты будут пытаться спрятаться
SetUnvisible => 1,

## Тип засевания: 1 - с Севера на Юг (как у Eshu), 2 - с Юга на Север, 3 - рандомно (лучше всего пока так)
FillType => 3,

## Поддерживать ли постройку новых зондов на планетах (0 - не строить)
## Если хотите строить - лучше ставить сразу 2 и более.
## Показывает сколько юнитов ставить в очередь на планетах с верфями
BuildUnits => 4,

## HungOff=0 - ничего не делать с уже поднятыми флотами (поведение старого скрипта)
## HungOff=1 - "Развешивание" ошибочно скучковавшихся флотов над планетами
## HungOff=2 - Использовать "старые" поля - с тем же именем но вне текущей зоны
HungOff => 1,

## "Уровень" отладочных сообщений. 9+=для поиска багов, 2=Расширенная статистика, 1=Обычная статистика, 0=Не надо логов, пожалуйста :)
loglevel => 1,

## Просто отладка. Ничего никуда не полетит (0=всё таки полетит)
NoRealSend => 0,

);

################################################################
## Настройки кончились. Началась работа :)

# Блок полезных переменных:

my @nlog; # Будущий лог
my %stat; # Будущая статистика

my @stat_map=(
area    => 'Общая площадь засевания (планет)',
has             => 'Всего засеянных планет',
totfl   => 'Планет в зоне засевания где уже есть наши флоты',
foundfl => 'Наших флотов в зоне засевания',
routed  => 'Флотов летит роутером (в зону засевания)',
raised  => 'Подняли флотов из гарнизона',
old             => 'Всего старых флотов (с тем же именем)',
unhang  => 'Использовано старых флотов',
added   => 'Добавлено на постройку',
sent    => 'Послали флотов роутером',
rest    => 'Осталось планет засеять',
chk             => 'Планет проверено на наличие флотов',
);

## Вычисляем id прототипа (original from Eshu)
$params{ProbeID} ||= {map {$_->getProp('s_name')||'a', $_->getProp('building_id')}
$Empire->designHouse->getPrototypes
}->{$params{ProbeName}};

my $HungOff=$params{HungOff};
my $RollOff=$HungOff & 2;
my $loglevel=$params{loglevel};

@planets = split /[,]/,$params{PLANETS} if $params{PLANETS};
($left,$top, $right,$bottom) = split /\D+/,$params{REGION} if $params{REGION};

push @nlog,"my %params=(",
"REGION => '$left:$top-$right:$bottom',",
'PLANETS => ['.join(',',@planets).'],',
map({my $q=($params{$_}=~/\D/)?"'":'';"$_ => $q$params{$_}$q,"}
qw/BuildUnits FillType SetUnvisible PlayerNames Mode FleetName FleetExtName ProbeName ProbeID HungOff loglevel NoRealSend/),
");" if $loglevel>=5;

my $lenline=$right-$left+1; # divider for one-dimension archive
my $Fleets=$Empire->fleets();

my @map; # Предварительный список планет
my (%Ignored,%HungFleets); # Хеши для "развешивания" флотов

## готовим список планет с информацией про наличие/отсутствие флотов
for (my $y=$top; $y<=$bottom;$y++){
for (my $x=$left;$x<=$right; $x++){
my @fl=$Fleets->getFleetsByLocation($x,$y);
$stat{chk}++;

# ищем "зависшие флоты" в районе
if ($HungOff){
foreach my $fl (@fl)
{
    my ($name,$id)=map $fl->getProp($_),qw/name id/;
    next unless $name eq $params{FleetName}; # по-хорошему тут надо match делать - чтобы ловить %.. будет флотоподнималка - добавлю.
    $Ignored{$id}=2;
    $HungFleets{"$x:$y"}=$id unless $RollOff;
    last; # только 1 флот на планету в Игнор-лист
}}

push @map,scalar @fl;
$stat{totfl}++,$stat{foundfl}+=scalar @fl if @fl}}

## корректируем список с учетом еще не прилетевших флотов
## (находящихся под управлением роутера)
foreach my $variable ($Empire->getVariablesNames)
{
    next unless $variable =~/^RouteFor(\d+)/;
    $Ignored{$1}=1 if $HungOff;

    my ($x,$y)=split /:/, $Empire->readVariable($variable);
    if ($x>=$left && $x<=$right && $y>=$top && $y<=$bottom)
    {
        my $index=($y-$top)*$lenline+$x-$left;
        $map[$index]=1;
        $stat{routed}++;
    }
}

## Строим список планет, куда нужно посылать зонды
my @rmap;
for (my $i=0; $i<scalar @map; $i++)
{
  $stat{has}++,next if $map[$i];
  push @rmap,$i;
} @map=(); # make GU happy

push @nlog, "Найдено планет для засевания: ".scalar(@rmap) if $loglevel>=2;

goto FINISH unless @rmap;

my %NewFleets;

## !!!! ВОТ ЭТУ ЧАСТЬ надо вынести в отдельный скрипт!!!!
## Также пока не ведётся слежение за количеством вновь создаваемых флотов
$Empire->fake(0); # чтобы создавать флоты

our $ms=1000;
sub Distance2($$$$) {
my ($x,$y,$xj,$yj) = @_;
my $dx=abs($x-$xj);
my $dy=abs($y-$yj);

$dy=$ms-$dy if $dy>$ms/2;
$dx=$ms-$dx if $dx>$ms/2;

return ( $dx**2 + $dy**2 ); # no sqrt !!!
}

## Сами создаём список планет с верфями откуда таскать..
unless (@planets && $params{MaxMyDist}>0)
{
  my ($xx,$yy)=(($left+$right)/2,($top+$bottom)/2); # Центр района
  my $Dist=$params{MaxMyDist}**2;
  foreach my $pl ($Empire->planets->getAllMy)
  {
        my ($x,$y)=map $pl->getProp($_),qw/x y/;

        my $dst=Distance2($x,$y,$xx,$yy);
        next if $dst>$Dist;
                # А есть ли тут верфь?
        push @planets,["$x:$y",$dst] if $Empire->harrison($x,$y)->getUnitsByClass(5);
  }
  # Сортируем планеты по удалённости от района
  @planets=map $_->[0],sort {$a->[1]<=>$b->[1]} @planets;
  push @nlog, "Список планет с верфями: (".join(',',@planets).")" if $loglevel>=2;
}

## перебираем планеты, откуда таскать зонды
for my $plcoord (@planets)
  {
#  last unless @rmap;
  my @xy=split /:/, $plcoord;
  my $Harrison = $Empire->harrison(@xy);
  my @units=$Harrison->getUnitsByClass($params{ProbeID});

  ## перебираем нужные зонды на планете
  foreach my $unit (@units)
     {
#    last unless @rmap;
     my $nFleet=$Harrison->createFleetNear($params{FleetName});
     my $FleetID=$nFleet->getProp('id');
     $NewFleets{$FleetID}=1;
     $Ignored{$FleetID}=3 if $HungOff;

     $unit->transferToAnotherFleet($FleetID);

     ## При необходимости шарим флоты
     $nFleet->Share($params{PlayerNames},$params{Mode}||0) if $params{PlayerNames};
     $nFleet->Rename($params{FleetName},$params{FleetExtName}||'Fleet');

     ## При необходимости включаем невидимость.
     ## Перечитывание флота - для обхода бага с включением невидимости
     $Empire->fleets->getFleetByID($FleetID)->show(0) if $params{SetUnvisible};
     $stat{raised}++;
     }

                ## если в гарнизоне зондов нужного типа осталось менее чем надо и в очереди менее 2-х то ставим в очередь новые
        if ($params{BuildUnits} && (@rmap > keys %NewFleets))
        {
         my $Queue=$Empire->queue(@xy);
         my $cnt=$Queue->itemsCount;
         push @nlog,"Длина очереди на $plcoord: $cnt"  if $loglevel>=5;

         $cnt=$params{BuildUnits}-$cnt;
         push @nlog, "На планете $plcoord добавляем в очередь $cnt новых семечек" if $cnt>0 && $loglevel>=2;
         $stat{added}++,$Queue->addJob($params{ProbeID}) or last while $cnt-->0;
        }
  }
## Конец выносимой части!
######

# Теперь ищем все флоты по названию.
# Отличия действий HungOff и RollOff:
# RollOff=1 - все флоты не в игнор-листе надо использовать (не надо вести хеш HungFleets)
if ($HungOff)
{
for my $fl ($Empire->fleets->getFleetsByName($params{FleetName}))
{
$stat{old}++;
     my ($x,$y,$FleetID)=map $fl->getProp($_),qw/x y id/;
     peaceBehavior($fl);
         if ($params{SetUnvisible})
         {
          my ($sl,$h,$ta)=map $fl->getProp($_),qw(stealth_lvl hidden turns_till_arrival);
          $sl=int($sl+0.99);
          $fl->show(0) if $sl && !$h && !$ta;
         }
     next if exists $Ignored{$FleetID};
     unless ($RollOff) {
        unless ($x>=$left && $x<=$right && $y>=$top && $y<=$bottom) # вне зоны = старое поле
        { # ищем только "зависшие флоты"
        if (exists $HungFleets{"$x:$y"}){next if $HungFleets{"$x:$y"} eq $FleetID}
        else {$HungFleets{"$x:$y"}=$FleetID;next}
        }
    }
    push @nlog, "Над планетой $x:$y найден флот $FleetID".($RollOff?'':" а тут уже есть флот ".$HungFleets{"$x:$y"}) if $loglevel>=5;
    $NewFleets{$FleetID}=3;
    $stat{unhang}++;
}
}

# А вот теперь, наконец посылаем флоты куда по-дальше :)
foreach my $FleetID (keys %NewFleets)
{
    last unless @rmap;
    ## Учитываем тип засевания
    my $line=   ($params{FillType}==1)? 0:# с начала
                ($params{FillType}==2)?-1:# с конца
                   int rand @rmap;# случайно

    my $coord=splice(@rmap,$line,1); # функция намного более могучая чем кажется :)

    my $xy=join':',($coord % $lenline)+$left,int($coord/$lenline)+$top;

     ## Создаем задание для маршрутизатора
     $Empire->writeVariable("RouteFor$FleetID",$xy) unless $params{NoRealSend};
     $stat{sent}++;
     push @nlog, "создаем переменную RouteFor$FleetID, куда засовываем $xy" if $loglevel>=5;
}

FINISH:

$stat{area}=(1+$right-$left)*(1+$bottom-$top);
# Пишем статистику в лог
$stat{rest}=scalar @rmap;
for (my $i=0;$i<@stat_map;$i+=2){
my $s=$stat{$stat_map[$i]};
push @nlog, $stat_map[$i+1].': '.$s if defined $s}

# Создаём лог
$Empire->clearLog;# unless $loglevel>=9;
if ($loglevel>0){$Empire->log(1,$_) for @nlog}

my $msg='';
my $ok=1;

if (!@rmap) {$msg="Поле засеяно!";$ok=0}
elsif (!@planets){$msg="Не найдено планет с верфями. Или расширьте радиус поиска, или напишите список вручную.";$ok=0}
elsif (@rmap){$msg="Остаётся засеять: ".@rmap}
else {$msg="Поле засеяно!";$ok=0}

$Empire->message($msg) if $msg;

$Empire->ok($ok);

sub peaceBehavior($) {
	my $fl = $Empire->fleets->getFleetByID( shift->getProp('id') );
	my $beh='333333';
	if ( $fl->getProp('stealth_lvl')>0 ) {
		$beh='555555';
	}
		$fl->SetBehaviour($beh);	
}