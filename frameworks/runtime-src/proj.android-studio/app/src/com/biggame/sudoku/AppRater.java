package com.biggame.sudoku;

import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.net.Uri;

public class AppRater {

	public static String RATED = "XRATED";
	public static String FIRST_TIME = "XFIRST_TIME";

	public static void showRateDialog(final Context mContext) {
		SharedPreferences pref = mContext.getSharedPreferences(
				mContext.getPackageName(), 0);
		final Editor editor = pref.edit();
		if (pref.getBoolean(FIRST_TIME, true)) {
			editor.putBoolean(FIRST_TIME, false);
			editor.commit();
		} else {
			if (pref.getBoolean(RATED, false))
				return;
			AlertDialog dialog = new AlertDialog.Builder(mContext)
					.setTitle(mContext.getString(R.string.rating))
					.setMessage(
							mContext.getString(R.string.rate_message))
					.setPositiveButton("Ok",
							new DialogInterface.OnClickListener() {

								@Override
								public void onClick(DialogInterface arg0,
										int arg1) {
									editor.putBoolean(RATED, true);
									editor.commit();
									try {
										mContext.startActivity(new Intent(
												Intent.ACTION_VIEW,
												Uri.parse("market://details?id="
														+ mContext
																.getPackageName())));

									} catch (ActivityNotFoundException e) {
										mContext.startActivity(new Intent(
												Intent.ACTION_VIEW,
												Uri.parse("http://play.google.com/store/apps/details?id="
														+ mContext
																.getPackageName())));
									}

								}
							})
					.setNegativeButton("No, thanks",
							new DialogInterface.OnClickListener() {

								@Override
								public void onClick(DialogInterface dialog,
										int which) {

								}
							}).create();
			dialog.show();
			editor.commit();
		}
	}
}
