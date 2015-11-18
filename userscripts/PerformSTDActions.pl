# PerformSTDActions v 1.70 script, by GribUser
# 23.10.2005
# + router jump 28.10.2010 by Rolling Stones

# ========== RUS ===============================================================
# Простенький скриптик, который интерпретирует еще более простые
# команды. Призван упростить жизнь, особенно тем, кто не силен
# в программировании. Просто скопируйте этот скрипт в свой флот
# и поменяйте список задач в начале

# ========== ENG ===============================================================
# Simple script to compile even more simple script.
# Should be usable for thouse who are not familar with
# programing. Simply edit task list below


#===============================================================================
# Вот это нужно менять, вставьте команды разделенные точкой с запятой
# Here is what you are going to edit - comands separated with semicolon
my $Actions=q{
  jump(500:500);
	perform(1);
  jump(505:505);
	load;
};
# Все, больше менять ничего не нужно
# That's it, you do not have to change anything below
#===============================================================================
#===============================================================================


#===== Quick help ==============================================================

# possible actions:
# jump(500:500) - make a jump
# perform(1)    - performs action by id

# hide          - turn stealth on
# show          - turn stealth off

# load          - take aboard any containers available, does not requare turn
#                 on your world, otherwise takes at least a turn and waits till
#                 there are ANY containers aboard. Then continues

# loadfull      - take aboard any containers available, does not requare turn
#                 on your world, otherwise takes at least a turn and waits till
#                 there are NO FREE TRANSPORT CELLS in the fleet. Then continues

# load_u        - take aboard any containers with any units available
# loadfull_u    - take aboard any containers with any units available till
#                 there are NO FREE TRANSPORT CELLS in the fleet. Then continues

# load_o, load_e, load_m, load_c, load_p, loadfull_o, loadfull_e ... - same for
#                 Organics, Energy, Minarals, Credits, Parts
# load_u#     - take aboard any containers with units with the class ID '#'
#               - you may provide multiple classes as well using comma #,##,#

# load_p#     - take aboard any containers with parts of the class ID '#'
#               - you may provide multiple classes as well using comma #,##,#

# unload        - unloads all containers, does not requare turn
#                on your world, otherwise takes turn

# unload_u      -  unloads all containers witn units inside
# unload_o, unload_e, unload_m, unload_c, unloadfull_o, unloadfull_e,
#									unloadfull_m - same
# unload_u#   - load container with any exact unit type inside


# wait          - do nothing, but stay where the fleet is
# reset         - starts the script from the first item
# goto_#      - starts the script from the item number # (zero-based)
#===============================================================================



#======= Script itself =========================================================
PerformSTDActions($Actions);

sub PerformSTDActions{
  my $Script=shift;
  $Script=~s/[\r\n\s]+//g;
  $Script=~s/;{2,}/;/g;
  $Script=~s/;\Z//g;
  my @ActionList=split(';',$Script);
  $Empire->log(1,scalar(@ActionList) ."-". $Empire->tag());
  my $Fleet = $Empire->this_fleet();
  my @ContainerClasses=(23,24,29);# =wrapped,unwrapped,parts
  my $Repeat=1;
  while ($Repeat){
    $Repeat=0;
    if (scalar(@ActionList) <= $Empire->tag()){
       $Empire->message("Finished, fleet is idle");
		   $Empire->clearLog();
       $Empire->ok(0);
       last;
    }
    my $CurrentAction=$ActionList[$Empire->tag()];
    if ($CurrentAction=~/\Ajump\((\d+)[:;.,\/](\d+)\)\Z/i){
      if ($Empire->getProp('paid_lvl'))
      {
	my ($cx, $cy, $id) = map $Fleet->getProp($_), qw(x y id);
        if ($cx == $1 && $cy == $2) {
          $Empire->writeVariable("RouteFor$id",undef);
          $Empire->message("Fleet arrived at destination.");
	  $Repeat = 1;         
        }elsif ($Fleet->jump($1, $2)) {
          $Empire->writeVariable("RouteFor$id",undef);
          $Empire->message("Jumping to $1:$2");          
        }else {
	  $Empire->writeVariable("RouteFor$id","$1:$2");        
          $Empire->message("Fleet sent to $1:$2 via router");
          $Empire->ok(0);
	}
      }
      elsif ($Fleet->jump($1,$2)){
        $Empire->message("Jumping to $1:$2");
      }
      else{  
        $Empire->message("Failed to jump to $1:$2");
        $Empire->ok(0);      
      }      
    } elsif ($CurrentAction=~/\Aperform\((\d+)\)\Z/i){
      my $PerformOK=0;
      for ($Fleet->getAllUnits()){
        $PerformOK=1 if $_->performAction($1);
      }
      if ($PerformOK){
        $Empire->message("Perform $1 OK");
      } else {
        $Empire->message("Failed to perform $1, skipped");
        $Empire->ok(0);
      }
    } elsif ($CurrentAction=~/\Ahide\Z/i){
      if ($Fleet->show(0)){
        $Empire->message("Fleet hidden OK");
        if ($ActionList[$Empire->tag()+1]=~/\A(perform|(un)?load)/i){
          $Repeat=1;
        }
      } else {
        $Empire->message("Failed to hide");
        $Empire->ok(0);
      }
    } elsif ($CurrentAction=~/\Ashow\Z/i){
      if ($Fleet->show(1)){
        $Empire->message("Fleet shown OK");
        if ($ActionList[$Empire->tag()+1]=~/\A(perform|(un)?load)/i){
          $Repeat=1;
        }
      } else {
        $Empire->message("Failed to show");
        $Empire->ok(0);
      }
    } elsif ($CurrentAction=~/\Aload(full)?(_([oempcu]))?(\d+)?\Z/i){
      my $NeedFull=$1?1:0;
      my $Selector=$3;
      my $UnitClass=$4;
      my $Harrison=$Empire->harrison($Fleet->getProp('x'),$Fleet->getProp('y'));
      if ($Harrison){
        my $Capas=$Fleet->getProp('free_transport_capacity');
        my $IsLoaded;
        for($Harrison->getUnitsByClass(@ContainerClasses)){
          last unless $Capas;
          next unless CheckIfContainerMatches($Selector,$UnitClass,$_->getProp('tag'),$_->getProp('part'));
          $IsLoaded=1 if $_->transferToAnotherFleet($Fleet->getProp('id'));
          $Capas--;
        }
        if($IsLoaded || scalar($Fleet->getUnitsByClass(@ContainerClasses))>0){
          if ($NeedFull && $Capas){
            $Empire->message("Still have free cells ($Capas)");
				    $Empire->clearLog();
            $Empire->ok(0);
          } else{
            $Repeat=1;
          }
        } else {
          $Empire->message("No containers loaded, waiting...");
#			 $Empire->clearLog();
          $Empire->ok(0);
        }
      } else {
        my @ContainersAboard=$Fleet->getUnitsByClass(@ContainerClasses);
        if (@ContainersAboard){
          if ($NeedFull && $Fleet->getProp('free_transport_capacity')){
            $Empire->message("Still have $Capas free cells...");
				$Empire->clearLog();
            $Empire->ok(0);
          } else{
            $Repeat=1;
          }
        } else {
          $Empire->message("No containers loaded, waiting...");
#			 $Empire->clearLog();
          $Empire->ok(0);
        }
      }
    } elsif ($CurrentAction=~/\Aunload(_([oempcu]))?(\d+)?\Z/i){
      my $Selector=$2;
      my $UnitClass=$3;
      my $Harrison=$Empire->harrison($Fleet->getProp('x'),$Fleet->getProp('y'));
      $Empire->message("Unloading...");
      for ($Fleet->getUnitsByClass(@ContainerClasses)){
        next unless CheckIfContainerMatches($Selector,$UnitClass,$_->getProp('tag'),$_->getProp('part'));
        if ($Harrison){
          $_->transferToAnotherFleet(0);
        } else {
          unless ($_->performAction(3)){
            $Empire->message("Unload failed!");
            $Empire->ok(0);
            last;
          }
        }
      }
      if ($ActionList[$Empire->tag()+1]=~/\A(perform|(un)?load|show|hide)/i or $Harrison){
        $Repeat=1;
      }
    } elsif ($CurrentAction=~/\Await\Z/i){
      $Empire->message("Idle...");
    } elsif ($CurrentAction=~/\Areset\Z/i){
      $Empire->tag(-1);
      $Repeat=1;
    } elsif ($CurrentAction=~/\Agoto_(\d+)\Z/i){
      $Empire->tag($1 - 1);
      $Repeat=1;
    } else {
      $Empire->message("Unknown operaion '$CurrentAction' requested!");
      $Empire->ok(0);
    }
    if ($Empire->ok()){
      $Empire->tag($Empire->tag()+1);
    }
  }
  if ($Empire->ok()){
    $Empire->clearLog();
  }
}

sub CheckIfContainerMatches{
  my ($Selector,$UnitClass,$Tag,$Part)=@_;
  return 1 unless $Selector;
  return 1 if !$UnitClass && ($Tag=~/<itm-in-pack/ && $Selector eq 'u' || $Tag=~/<res-in-pack res="$Selector"/ || $Part && $Selector eq 'p');
  if($Selector eq 'u'){
    return 1 for(grep {$Tag=~/<itm-in-pack.*class-id="$_"/} split(',',$UnitClass));
  }elsif($Part){
    return 1 for(grep {$Part->{'id'}==$_} split(',',$UnitClass));
  }
  return 0;
}