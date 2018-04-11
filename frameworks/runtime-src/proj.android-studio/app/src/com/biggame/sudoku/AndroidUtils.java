package com.biggame.sudoku;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.util.Log;
import android.widget.Toast;

import com.biggame.base.SnapshotCoordinator;
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.auth.api.signin.GoogleSignInResult;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Result;
import com.google.android.gms.drive.Drive;
import com.google.android.gms.games.AchievementsClient;
import com.google.android.gms.games.Games;
import com.google.android.gms.games.GamesClientStatusCodes;
import com.google.android.gms.games.LeaderboardsClient;
import com.google.android.gms.games.Player;
import com.google.android.gms.games.PlayersClient;
import com.google.android.gms.games.SnapshotsClient;
import com.google.android.gms.games.snapshot.Snapshot;
import com.google.android.gms.games.snapshot.SnapshotMetadata;
import com.google.android.gms.games.snapshot.SnapshotMetadataChange;
import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;

import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import java.io.IOException;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Random;

/*Created by thaod on 1/14/2018.*/


public class AndroidUtils {
    final static String TAG = "AndroidUtils";
    final static int RC_SIGN_IN = 1001;
    final static int RC_LEADERBOARD_ID = 1002;
    private static final int RC_LIST_SAVED_GAME = 9002;
    private static final int RC_SELECT_SNAPSHOT = 9003;
    private static final int RC_SAVE_SNAPSHOT = 9004;
    private static final int RC_LOAD_SNAPSHOT = 9005;

    private String currentSaveName = "snapshotTemp";

    public static AndroidUtils instance;

    private Activity ac;
    private AdmobHelper admobHelper;

    AchievementsClient mAchievementsClient;
    LeaderboardsClient mLeaderboardsClient;
    PlayersClient mPlayersClient;

    private SnapshotsClient mSnapshotsClient = null;
    private String mCurrentSaveName = "snapshotTemp";

    public AndroidUtils(Activity ac)
    {
        this.ac = ac;
    }

    public static void shareMyApp(){
        Intent sendIntent = new Intent();
        sendIntent.setAction(Intent.ACTION_SEND);
        sendIntent.putExtra(Intent.EXTRA_TEXT, "https://play.google.com/store/apps/details?id="+AndroidUtils.instance.ac.getPackageName());
        sendIntent.setType("text/plain");
        AndroidUtils.instance.ac.startActivity(Intent.createChooser(sendIntent, AndroidUtils.instance.ac.getResources().getText(R.string.app_name)));
    }

    public static void signIn(){
        AndroidUtils.instance.signInSilently();
    }

    public static void rateMyApp(){
        Activity ac = AndroidUtils.instance.ac;
        try {
            ac.startActivity(new Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse("market://details?id="
                            + ac
                            .getPackageName())));

        } catch (ActivityNotFoundException e) {
            ac.startActivity(new Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse("http://play.google.com/store/apps/details?id="
                            + ac
                            .getPackageName())));
        }
    }

    public static void showRanking(){
        AndroidUtils.instance.showLeaderBoard();
    }

    public static void updateHighScore(int highScore){
        Log.d(TAG,"updateHighScore "+ highScore);
        AndroidUtils.instance.updateScore(highScore);
    }

    public static void showInterstitialAd(){
        Log.d(TAG, "show InterstitialAd");
        AndroidUtils.instance.ac.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AndroidUtils.instance.admobHelper.showInterstitialAd();
            }
        });
    }

    public static void showVideoRewardAd(){
        Log.d(TAG, "showVideoRewardAd");
        AndroidUtils.instance.ac.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AndroidUtils.instance.admobHelper.showVideoRewardAd();
            }
        });
    }

    public static void showBanner(){
        AndroidUtils.instance.ac.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AndroidUtils.instance.admobHelper.showAdView();
            }
        });
    }

    public static void hideBanner(){
        AndroidUtils.instance.ac.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AndroidUtils.instance.admobHelper.hideAdView();
            }
        });

    }

    public static void initBanner(){
        AndroidUtils.instance.ac.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AndroidUtils.instance.admobHelper.initBanner(AndroidUtils.instance.ac);
            }
        });

    }


    public void showLeaderBoard(){
        if(mLeaderboardsClient == null) return;
        mLeaderboardsClient.getLeaderboardIntent(ac.getString(R.string.leader_board_id))
                .addOnSuccessListener(new OnSuccessListener<Intent>() {
                    @Override
                    public void onSuccess(Intent intent) {
                        ac.startActivityForResult(intent, RC_LEADERBOARD_ID);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        handleException(e, ac.getString(R.string.leaderboards_exception));
                    }
                });
    }

    public void updateScore(int score){
        if(mLeaderboardsClient == null) return;
        mLeaderboardsClient.submitScore(ac.getString(R.string.leader_board_id), score);
    }

    private void signInSilently(){
        GoogleSignInOptions signInOptions = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_GAMES_SIGN_IN)
                .requestScopes(Drive.SCOPE_APPFOLDER).build();

        GoogleSignInClient signInClient = GoogleSignIn.getClient(ac,
                signInOptions);

        signInClient.silentSignIn().addOnCompleteListener(ac, new OnCompleteListener<GoogleSignInAccount>() {
            @Override
            public void onComplete(@NonNull Task<GoogleSignInAccount> task) {
                if(task.isSuccessful()){
                    onConnected(task.getResult());
                } else {
                    startSignInIntent();
                }
            }
        });
    }

    private void startSignInIntent() {
        GoogleSignInClient signInClient = GoogleSignIn.getClient(ac,
                GoogleSignInOptions.DEFAULT_GAMES_SIGN_IN);
        Intent intent = signInClient.getSignInIntent();
        ac.startActivityForResult(intent, RC_SIGN_IN);
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data){
        if(requestCode == RC_SIGN_IN){
            GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(data);

            if(result.isSuccess()){
                GoogleSignInAccount signedInAccount = result.getSignInAccount();
                onConnected(signedInAccount);
            } else {
                String message = result.getStatus().getStatusMessage();
                if(message == null || message.isEmpty()){
                    message = ac.getString(R.string.signin_other_error);
                }

                new AlertDialog.Builder(ac).setMessage(message).
                        setNeutralButton(android.R.string.ok, null).show();
            }
        } else if(requestCode == RC_SAVE_SNAPSHOT){
            if (data.hasExtra(SnapshotsClient.EXTRA_SNAPSHOT_METADATA)) {
                // Load a snapshot.
                SnapshotMetadata snapshotMetadata =
                        data.getParcelableExtra(SnapshotsClient.EXTRA_SNAPSHOT_METADATA);
                mCurrentSaveName = snapshotMetadata.getUniqueName();

                // Load the game data from the Snapshot
                // ...
            } else if (data.hasExtra(SnapshotsClient.EXTRA_SNAPSHOT_NEW)) {
                // Create a new snapshot named with a unique string
                String unique = new BigInteger(281, new Random()).toString(13);
                mCurrentSaveName = "snapshotTemp-" + unique;

                // Create the new snapshot
                // ...
            }

        }
    }

    private boolean isSignedIn()
    {
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(ac);
        if(account != null) return true;
        return false;
    }

    private void onConnected(GoogleSignInAccount googleSignInAccount) {
        Log.d(TAG, "onConnected(): connected to Google APIs");

        mAchievementsClient = Games.getAchievementsClient(this.ac, googleSignInAccount);
        mLeaderboardsClient = Games.getLeaderboardsClient(this.ac, googleSignInAccount);
        mPlayersClient = Games.getPlayersClient(this.ac, googleSignInAccount);

        // Set the greeting appropriately on main menu
        mPlayersClient.getCurrentPlayer()
                .addOnCompleteListener(new OnCompleteListener<Player>() {
                    @Override
                    public void onComplete(@NonNull Task<Player> task) {
                        String displayName;
                        if (task.isSuccessful()) {
                            displayName = task.getResult().getDisplayName();
                        } else {
                            Exception e = task.getException();
                            handleException(e, ac.getString(R.string.players_exception));
                            displayName = "???";
                        }
                        Log.d(TAG, "Hello "+ displayName);
                        Toast.makeText(ac, ac.getString(R.string.hello)+displayName, Toast.LENGTH_LONG );
                    }
                });
        mSnapshotsClient = Games.getSnapshotsClient(ac, googleSignInAccount);
        showSaveGameUI();
    }

    public void setAdmobHelper(AdmobHelper admobHelper) {
        this.admobHelper = admobHelper;
    }

    private void handleException(Exception e, String details) {
        int status = 0;

        if (e instanceof ApiException) {
            ApiException apiException = (ApiException) e;
            status = apiException.getStatusCode();
        }

        String message = ac.getString(R.string.status_exception_error, details, status, e);

        new AlertDialog.Builder(ac)
                .setMessage(message)
                .setNeutralButton(android.R.string.ok, null)
                .show();

        if (status == GamesClientStatusCodes.SNAPSHOT_NOT_FOUND) {
            Log.i(TAG, "Error: Snapshot not found");
            Toast.makeText(ac.getBaseContext(), "Error: Snapshot not found",
                    Toast.LENGTH_SHORT).show();
        } else if (status == GamesClientStatusCodes.SNAPSHOT_CONTENTS_UNAVAILABLE) {
            Log.i(TAG, "Error: Snapshot contents unavailable");
            Toast.makeText(ac.getBaseContext(), "Error: Snapshot contents unavailable",
                    Toast.LENGTH_SHORT).show();
        } else if (status == GamesClientStatusCodes.SNAPSHOT_FOLDER_UNAVAILABLE) {
            Log.i(TAG, "Error: Snapshot folder unavailable");
            Toast.makeText(ac.getBaseContext(), "Error: Snapshot folder unavailable.",
                    Toast.LENGTH_SHORT).show();
        }
    }

    private void showSaveGameUI(){
        SnapshotsClient snapshotsClient =
                Games.getSnapshotsClient(ac, GoogleSignIn.getLastSignedInAccount(ac));
        int maxNumberOfSavedGamesToShow = 2;

        Task<Intent> intentTask = snapshotsClient.getSelectSnapshotIntent(
                "See My Saves", true, true, maxNumberOfSavedGamesToShow);

        intentTask.addOnSuccessListener(new OnSuccessListener<Intent>() {
            @Override
            public void onSuccess(Intent intent) {
                ac.startActivityForResult(intent, RC_SAVE_SNAPSHOT);
            }
        });

        intentTask.addOnCompleteListener(new OnCompleteListener<Intent>() {
            @Override
            public void onComplete(@NonNull Task<Intent> task) {
                if(task.isSuccessful()){
                    ac.startActivityForResult(task.getResult(), RC_LIST_SAVED_GAME);
                } else {
                    handleException(task.getException(), ac.getString(R.string.show_snapshots_error));
                }
            }
        });
    }

    void saveSnapshot(final SnapshotMetadata snapshotMetadata){
        waitForClosedAndOpen(snapshotMetadata)
                .addOnCompleteListener(new OnCompleteListener<SnapshotsClient.DataOrConflict<Snapshot>>() {
                    @Override
                    public void onComplete(@NonNull Task<SnapshotsClient.DataOrConflict<Snapshot>> task) {
                        SnapshotsClient.DataOrConflict<Snapshot> result = task.getResult();
                        Snapshot snapshotToWrite = processOpenDataOrConflict(RC_SAVE_SNAPSHOT, result, 0);

                        if (snapshotToWrite == null) {
                            // No snapshot available yet; waiting on the user to choose one.
                            return;
                        }

                        Log.d(TAG, "Writing data to snapshot: " + snapshotToWrite.getMetadata().getUniqueName());
                        writeSnapshot(snapshotToWrite)
                                .addOnCompleteListener(new OnCompleteListener<SnapshotMetadata>() {
                                    @Override
                                    public void onComplete(@NonNull Task<SnapshotMetadata> task) {
                                        if (task.isSuccessful()) {
                                            Log.i(TAG, "Snapshot saved!");
                                        } else {
                                            handleException(task.getException(), ac.getString(R.string.write_snapshot_error));
                                        }
                                    }
                                });
                    }
                });
    }

    Snapshot processOpenDataOrConflict(int requestCode,
                                       SnapshotsClient.DataOrConflict<Snapshot> result,
                                       int retryCount) {
        retryCount++;

        if (!result.isConflict()) {
            return result.getData();
        }

        Log.i(TAG, "Open resulted in a conflict!");

        SnapshotsClient.SnapshotConflict conflict = result.getConflict();
        final Snapshot snapshot = conflict.getSnapshot();
        final Snapshot conflictSnapshot = conflict.getConflictingSnapshot();

        ArrayList<Snapshot> snapshotList = new ArrayList<Snapshot>(2);
        snapshotList.add(snapshot);
        snapshotList.add(conflictSnapshot);

        // Display both snapshots to the user and allow them to select the one to resolve.
        selectSnapshotItem(requestCode, snapshotList, conflict.getConflictId(), retryCount);
        // Since we are waiting on the user for input, there is no snapshot available; return null.
        return null;
    }

    private void selectSnapshotItem(int requestCode,
                                    ArrayList<Snapshot> items,
                                    String conflictId,
                                    int retryCount) {

        ArrayList<SnapshotMetadata> snapshotList = new ArrayList<SnapshotMetadata>(items.size());
        for (Snapshot m : items) {
            snapshotList.add(m.getMetadata().freeze());
        }
        Intent intent = new Intent(ac, SelectSnapshotActivity.class);
        intent.putParcelableArrayListExtra(SelectSnapshotActivity.SNAPSHOT_METADATA_LIST,
                snapshotList);

        intent.putExtra(SelectSnapshotActivity.CONFLICT_ID, conflictId);
        intent.putExtra(SelectSnapshotActivity.RETRY_COUNT, retryCount);

        Log.d(TAG, "Starting activity to select snapshot");
        startActivityForResult(intent, requestCode);
    }

    private Task<SnapshotMetadata> writeSnapshot(Snapshot snapshot,
                                                 byte[] data, Bitmap coverImage, String desc) {

        // Set the data payload for the snapshot
        snapshot.getSnapshotContents().writeBytes(data);

        // Create the change operation
        SnapshotMetadataChange metadataChange = new SnapshotMetadataChange.Builder()
                .setCoverImage(coverImage)
                .setDescription(desc)
                .build();

        SnapshotsClient snapshotsClient =
                Games.getSnapshotsClient(ac, GoogleSignIn.getLastSignedInAccount(ac));

        // Commit the operation
        return snapshotsClient.commitAndClose(snapshot, metadataChange);
    }

    Task<byte[]> loadSnapshot() {
        // Display a progress dialog
        // ...

        // Get the SnapshotsClient from the signed in account.
        SnapshotsClient snapshotsClient =
                Games.getSnapshotsClient(ac, GoogleSignIn.getLastSignedInAccount(ac));

        // In the case of a conflict, the most recently modified version of this snapshot will be used.
        int conflictResolutionPolicy = SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED;

        // Open the saved game using its name.
        return snapshotsClient.open(mCurrentSaveName, true, conflictResolutionPolicy)
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.e(TAG, "Error while opening Snapshot.", e);
                    }
                }).continueWith(new Continuation<SnapshotsClient.DataOrConflict<Snapshot>, byte[]>() {
                    @Override
                    public byte[] then(@NonNull Task<SnapshotsClient.DataOrConflict<Snapshot>> task) throws Exception {
                        Snapshot snapshot = task.getResult().getData();

                        // Opening the snapshot was a success and any conflicts have been resolved.
                        try {
                            // Extract the raw data from the snapshot.
                            return snapshot.getSnapshotContents().readFully();
                        } catch (IOException e) {
                            Log.e(TAG, "Error while reading Snapshot.", e);
                        }

                        return null;
                    }
                }).addOnCompleteListener(new OnCompleteListener<byte[]>() {
                    @Override
                    public void onComplete(@NonNull Task<byte[]> task) {
                        // Dismiss progress dialog and reflect the changes in the UI when complete.
                        // ...
                    }
                });
    }

    private Task<SnapshotsClient.DataOrConflict<Snapshot>> waitForClosedAndOpen(final SnapshotMetadata snapshotMetadata) {

        final boolean useMetadata = snapshotMetadata != null && snapshotMetadata.getUniqueName() != null;
        if (useMetadata) {
            Log.i(TAG, "Opening snapshot using metadata: " + snapshotMetadata);
        } else {
            Log.i(TAG, "Opening snapshot using currentSaveName: " + currentSaveName);
        }

        final String filename = useMetadata ? snapshotMetadata.getUniqueName() : currentSaveName;

        return SnapshotCoordinator.getInstance()
                .waitForClosed(filename)
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        handleException(e, "There was a problem waiting for the file to close!");
                    }
                })
                .continueWithTask(new Continuation<Result, Task<SnapshotsClient.DataOrConflict<Snapshot>>>() {
                    @Override
                    public Task<SnapshotsClient.DataOrConflict<Snapshot>> then(@NonNull Task<Result> task) throws Exception {
                        Task<SnapshotsClient.DataOrConflict<Snapshot>> openTask = useMetadata
                                ? SnapshotCoordinator.getInstance().open(mSnapshotsClient, snapshotMetadata)
                                : SnapshotCoordinator.getInstance().open(mSnapshotsClient, filename, true);
                        return openTask.addOnFailureListener(new OnFailureListener() {
                            @Override
                            public void onFailure(@NonNull Exception e) {
                                handleException(e,
                                        useMetadata
                                                ? ac.getString(R.string.error_opening_metadata)
                                                : ac.getString(R.string.error_opening_filename)
                                );
                            }
                        });
                    }
                });
    }


    public static void callJSAddGold(int num){
        String str = String.format("PlatformUtils.prototype.javaCallBackAddGold(%d);", num);
        Cocos2dxJavascriptJavaBridge.evalString(str);
    }
}
